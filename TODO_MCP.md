# MCP follow-ups

Review of commit `746bf3c` (MCP server with Better Auth OAuth, backed by oRPC procedures).
The core flow works and was tested end to end: discovery, dynamic client registration (DCR), PKCE, consent,
both MCP tools, refresh token rotation, and rejection between native JWTs and OAuth tokens.
The items below are production readiness and maintenance work, most important first.

## How the integration works

- `packages/web/src/api/auth/server.ts`: the `mcp()` plugin makes Better Auth an OAuth provider for `/mcp`.
  Clients register through DCR. There is no CIMD.
- `packages/web/src/routes/[.]well-known/$.ts`: sends root discovery requests to Better Auth.
- `packages/web/src/routes/mcp.ts` → `packages/web/src/api/mcp.ts`: `requireMcpAuth` checks the token,
  `createMcpHandler` (legacy stateless) serves MCP, and `McpRegistrar` exposes the procedures in `mcpRouter`.
- `packages/web/src/api/procedures.ts`: `authed` procedures accept a caller that the server verified
  (`context.auth`). HTTP input cannot set it.
- `packages/web/src/routes/consent.tsx`: the consent page. `/test-auth` is the login page.

## 1. Rate limit anonymous client registration (fix before production)

`/api/auth/oauth2/register` accepts anonymous registrations (`allowUnauthenticatedClientRegistration: true`).
Anyone can create clients with a name and logo they choose.
Better Auth's default rate limiter keeps its counts in memory. On Workers, each instance counts separately.

Option A, recommended: add a Cloudflare WAF rate-limit rule on `/api/auth/oauth2/register`,
for example 10 requests per minute per IP.

Option B: store Better Auth's limit counts in the database. This needs a `rateLimit` table,
so run `bun run db:generate` and migrate.

`packages/web/src/api/auth/server.ts`:

```ts
rateLimit: {
  storage: 'database',
  customRules: { '/oauth2/register': { window: 60, max: 10 } }
},
```

## 2. A missing URL silently falls back to localhost

`packages/web/src/api/auth/server.ts` uses `http://localhost:7777` when `env.BETTER_AUTH_URL` is not a string.
The fallback exists because the `auth generate` CLI replaces Worker bindings with proxy objects.
If a deployed Worker ever lacks the binding, OAuth tokens get the wrong `aud`/`iss`, and nothing reports the cause.
Alchemy always sets the binding today, so the risk is low.

Follow-up: fail loudly outside the schema CLI. First find a reliable way to detect the CLI context.

## 3. False error in the log on every cold start

Each new Worker instance logs:

```text
oauth-provider: could not seed `resources` at startup; retrying on first resource access.
Error: No StartEvent found in AsyncLocalStorage.
```

The seed runs at startup, outside a request, where the per-request database (`src/db/client.ts`) is not available.
It retries and succeeds on the first request. The error is harmless but misleading in production logs.

Follow-up: add a comment next to the `mcp()` config that explains this, like the existing
`validateSchema: false` comment. Optionally filter the message in a logger.

## 4. The signing-key secret is a single point of failure

JWKS private keys are encrypted with `BETTER_AUTH_SECRET`. If the secret changes (for example after Alchemy state
loss creates a new `BetterAuthSecret`), the signing key cannot be decrypted. Then these all fail:

- Native JWTs (`/api/auth/token`), as before.
- OAuth token issuance.
- Every MCP call.

Local symptom seen during testing: `Failed to decrypt private key`.
Recovery: delete the old `jwks` rows. Better Auth then creates a new key, and all existing tokens become invalid.
Keep the Alchemy state backed up.

## 5. Verify the consent query on the server before rendering

`/consent` shows `client_id`, `scope`, and the `redirect_uri` host straight from the URL.
Better Auth checks the signed query on Allow, so tampering cannot grant access.
It can only mislead the user about what they approve.

Follow-up: verify the query on the server before render with `verifyOAuthQueryParams` from
`@better-auth/oauth-provider`. Load the client with `auth.api.getOAuthClientPublic`.
Show `logo_uri`/`client_uri`/`tos_uri`/`policy_uri` only for `https:` URLs.
See https://better-auth.com/docs/plugins/oauth-provider/sign-in-flow#consent-page

## 6. Smaller items

### Stale comment

`packages/web/src/api/procedures.ts`, above `authedProcedure`:

```ts
/** Rejects with UNAUTHORIZED unless a server-verified caller, session, JWT, or API key is present. */
```

### Revocation delay

The MCP route checks OAuth access tokens against the signing keys, not the database.
A revoked consent or a sign-out takes effect only when the token expires (1 hour by default).
If that matters, set a lower `accessTokenExpiresIn` (seconds) in `mcp({...})`.

### Two database reads per MCP request

1. The JWKS lookup. `jwksUrl` is a function (a workaround to avoid a Worker fetch to its own URL),
   so the verifier does not cache it.
2. The user lookup in `authenticateOAuth`, which confirms the user still exists.

This is acceptable at the current scale. If it becomes a cost, cache the JWKS for a short time in the function.

The JWKS workaround depends on Better Auth internals: the type allows only a URL string, but 1.7.17 also accepts
a function. On a Better Auth upgrade, check that it still works. If not, call `verifyAccessTokenRequest`
from `better-auth/oauth2` directly and build challenges with `createResourceServerChallenge`.

### `/.well-known/$` catch-all

Every `/.well-known/*` path goes to Better Auth. For other well-known files (`security.txt`,
`apple-app-site-association`, `assetlinks.json`), add a specific route.

### No CORS

Browser-based MCP clients (for example MCP Inspector in browser mode) need CORS on `/mcp`, the discovery routes,
and the token endpoint. OpenCode and server-side clients do not. Add CORS only when a browser client needs it.

### No management of connected agents

Users cannot see or revoke connected agents. Better Auth provides `authClient.oauth2.getConsents` and
`authClient.oauth2.deleteConsent`. A small settings page can list and revoke them.

### Documentation

Add a short README section:

- How to connect: `opencode mcp add <name> --url https://<host>/mcp`, then sign in from `/mcps`.
- How to expose a new tool: add the procedure to `mcpRouter` in `packages/web/src/api/mcp.ts`.
  Give it `openapi({ summary, description })` metadata, because the tool title and description come from it.
- Only `authed` procedures must be exposed when a tool needs a user. Public procedures run without one.

## No action needed

- Tools come from an explicit list (`mcpRouter`), so new API procedures stay private by default.
- Native JWTs and OAuth tokens reject each other (different `iss`, `aud`, and `azp`). Both were tested.
- The migration and snapshot are committed. The `oauthClientAssertion` relation entry in `src/db/schema.ts`
  follows the existing pattern for tables without foreign keys.
