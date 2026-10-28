---
name: project-init
description: Initialize a project copied from this template. Use when the user requests initial setup or replacement of template package names and project identity.
---

# Project initialization

## Confirm the identity

1. Read the root and workspace manifests.
2. Review local changes before edits.
3. Ask for the project slug, display name, and package scope.
4. Offer the directory name as the default slug and scope.
5. Confirm the final names before edits.

Use a lowercase, hyphen-separated slug.

## Apply the identity

Use these package names unless the user specifies alternatives:

| Template package | Project package |
| --- | --- |
| @dunbar/base-template | PROJECT_SLUG |
| @dunbar/web-template | @SCOPE/web |
| @dunbar/ui-template | @SCOPE/ui |
| @dunbar/shared-template | @SCOPE/shared |

1. Update workspace manifests and dependency keys.
2. Update package imports and exports throughout source files.
3. Update package aliases in UI tsconfig.json and components.json.
4. Update package references inside shadcn components without other code changes.
5. Update the stack name in packages/web/alchemy.run.ts.
6. Update template-specific page titles, headings, API titles, and demo labels.
7. Update the README title to the project display name.

Review each replacement.
Do not replace unrelated text globally.

## Preserve the template architecture

- Preserve local edits, comments, and unrelated configuration.
- Preserve dependency versions, catalog entries, and exact pins.
- Preserve workspace:* and catalog: dependency references.
- Preserve @/ aliases and the generated API type boundary.
- Preserve demo components and routes.
- Do not regenerate or restyle shadcn components.
- Do not edit bun.lock directly.
- Do not edit routeTree.gen.ts or packages/shared/api/generated.
- Skip node_modules, .git, .alchemy, and build output.
- Exclude this skill from template identifier replacements and residual-reference checks.
- Do not delete files except for the final skill cleanup below.
- Do not alter Git history or deploy.
- Do not start the dev server or run tests.

## Complete initialization

Run these commands from the repository root:

1. Run `bun install`.
2. Run `bunx tsdown`.
3. Run `bun run typecheck`.
4. Fix errors introduced by initialization.
5. After fixes, repeat declaration generation and the typecheck.
6. Confirm that active source and configuration contain no obsolete template identifiers.
7. If any required step fails, retain the skill and report the failure.
8. After all steps succeed, delete skills/project-init/.
9. If skills/ is empty, delete it.
10. If other files remain in skills/, request approval before their removal.
11. Report the final project identity and verification results.

Do not claim runtime verification from a typecheck alone.
Do not report successful initialization if a required command fails.
Tell the user to run `bun run dev` after success.
