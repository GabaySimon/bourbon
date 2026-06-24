# bourbon
The full-stack framework for vanilla JS + Supabase.

Secure Edge Functions by default, a built-in router & one command to deploy. No React. No boilerplate. Just JavaScript.

> ⚠️ Early development. Not ready for use yet.



## Why Bourbon?
Building a SaaS on vanilla JS + Supabase means solving the same problems from scratch every time: wiring up routing without a framework, writing the same auth boilerplate in every Edge Function, figuring out where components go, configuring Vite and Supabase to work together locally, ...

Bourbon solves all of it with one set of conventions and one CLI.

**Secure Edge Functions by default.** Raw Supabase Edge Functions are ~40 lines of boilerplate per function -- auth verification, client initialization, error handling, all identical between functions. Most apps ship with unprotected endpoints because the auth check gets skipped. In Bourbon, auth is the default. You write the logic; Bourbon generates the rest.

```js
// api/posts.js
export const getPosts = query({ key: 'posts' })
  .handler(async ({ db, user }) => {
    return db.from('posts').select('*').eq('user_id', user.id)
  })
```

**A router that works.** Nested routes with layouts that don't flicker, auth guards wired to Supabase, dynamic params -- all for vanilla JS.

**Caching without a library.** Declare a cache key on a query, declare what a mutation invalidates, and Bourbon keeps your UI in sync automatically. No TanStack Query, no manual refetching.

**Structured schema.** Tables, RLS policies, RPCs, triggers, and seed data each in their own file -- because each changes at a different rate. `bourbon dev` applies them automatically on every local start.

**One command to start everything.** Vite, Supabase local, and the function watcher -- all in one terminal, zero configuration.



## Quick start
```bash
# Not published yet (coming soon)
bourbon init my-app
cd my-app
bourbon dev
```



## Documentation
- [Architecture](./docs/architecture.md) · how the pieces fit together
- [Conventions](./docs/conventions.md) · folder structure & naming
- [Primitives](./docs/primitives.md) · query, mutate, webhook



## License
MIT