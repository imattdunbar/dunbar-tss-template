import { Button, buttonVariants } from '@dunbar/ui-template/components/button'
import { Label } from '@dunbar/ui-template/components/label'
import { Textarea } from '@dunbar/ui-template/components/textarea'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { orpc } from '@web/api/client'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.query(orpc.posts.list.queryOptions())
  },
  component: Home
})

function Home() {
  const [text, setText] = useState('')
  const queryClient = useQueryClient()
  const { data: posts } = useSuspenseQuery(orpc.posts.list.queryOptions())
  const createPost = useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: async () => {
        setText('')
        await queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() })
      }
    })
  )

  return (
    <main className="mx-auto grid w-full max-w-2xl gap-8 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Dunbar Template</h1>
          <p className="text-muted-foreground text-sm">A simple post example backed by D1.</p>
        </div>
        <Link to="/demo" className={buttonVariants({ variant: 'outline' })}>
          Component workshop
        </Link>
      </header>

      <form
        method="post"
        className="grid gap-3 rounded-xl border p-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!text.trim() || createPost.isPending) return
          createPost.mutate({ text })
        }}
      >
        <Label htmlFor="post-text">Write a post</Label>
        <Textarea
          id="post-text"
          name="text"
          placeholder="What is on your mind?"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
          required
          disabled={createPost.isPending}
          className="min-h-28"
        />
        {createPost.isError && (
          <p role="alert" className="text-destructive text-sm">
            {createPost.error.message}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">{text.length}/2000</p>
          <Button type="submit" disabled={!text.trim() || createPost.isPending}>
            {createPost.isPending ? 'Please wait…' : 'Add post'}
          </Button>
        </div>
      </form>

      <section className="grid gap-4" aria-labelledby="posts-title">
        <h2 id="posts-title" className="text-lg font-semibold">
          Posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts yet. Add the first one above.</p>
        ) : (
          <ul className="grid gap-3" aria-live="polite">
            {posts.map((post) => (
              <li key={post.id} className="grid gap-2 rounded-xl border p-5">
                <p className="text-muted-foreground text-xs">Post #{post.id}</p>
                <p className="break-words whitespace-pre-wrap">{post.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
