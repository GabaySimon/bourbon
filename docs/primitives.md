# Primitives
Bourbon's backend is built from three primitives: `query`, `mutate`, and `webhook`. Each one wraps your handler and hands the repetitive, security-critical work to the Bourbon runtime. All three live in files under `api/`.



## The builder pattern
Every primitive follows the same shape:

```js
primitive(options)
  .handler(async ({ db, user, body, params, query }) => {
    // your logic here
  })
```

Call the primitive with optional configuration, then chain `.handler()` to attach your function. You never write auth checks, client initialization, error handling, or Deno boilerplate -- the runtime does all of it.



## `query` -- reading data
Auth required by default.

```js
import { query } from '@bourbon/core'

export const getPosts = query({ key: 'posts' })
  .handler(async ({ db, user }) => {
    return db.from('posts').select('*').eq('user_id', user.id)
  })
```

The handler receives:
- `db`: Supabase client scoped to the authenticated user. RLS enforced.
- `user`: the authenticated user (`null` on public endpoints)
- `params`: URL path parameters e.g. `/posts/:id` → `{ id: '42' }`
- `query`: query string values e.g. `?page=2` → `{ page: '2' }`

There is no `body` → queries are read-only by design.

**Options:**
- `key`: cache key for the result
- `mcp` + `description`: expose as an MCP tool for AI agents 
  (`description` is what the agent reads to understand what this endpoint does)

**Public endpoints** use `query.public`:
```js
export const getPublishedPosts = query.public({ key: 'published-posts' })
  .handler(async ({ db }) => {
    return db.from('posts').select('*').eq('published', true)
  })
```



## `mutate` -- writing data
Auth required by default. Use for anything that changes state -- database writes, RPC calls, external API calls, or multi-step orchestration.

```js
import { mutate } from '@bourbon/core'

export const createPost = mutate({ invalidates: ['posts'] })
  .handler(async ({ db, user, body }) => {
    return db.from('posts').insert({ ...body, user_id: user.id })
  })
```

The handler receives everything `query` does, plus:
- `body`: the parsed request body sent by the frontend

**Options:**
- `invalidates`: cache keys to bust after this mutation succeeds
- `mcp` + `description`: expose as an MCP tool for AI agents
  (`description` is what the agent reads to understand what this endpoint does)

**Public endpoints** use `mutate.public`:
```js
export const submitContactForm = mutate.public()
  .handler(async ({ db, body }) => {
    return db.from('contact_submissions').insert(body)
  })
```



## `webhook` -- external callbacks
Always public. No user JWT → webhooks are called by external services, not your users. Use for callbacks from Stripe, SignWell, GitHub, or any third party.

```js
import { webhook } from '@bourbon/core'

export const stripeWebhook = webhook()
  .verify(async ({ req, body }) => {
    const sig = req.headers.get('stripe-signature')
    return verifyStripeSignature(sig, body)
  })
  .handler(async ({ db, body }) => {
    if (body.type !== 'payment_intent.succeeded') {
      return { received: true }
    }
    const adminDb = db.bypassRLS()
    await adminDb
      .from('orders')
      .update({ status: 'paid' })
      .eq('stripe_payment_intent_id', body.data.object.id)
    return { received: true }
  })
```

The handler receives:
- `db`: Supabase client running as the `anon` role
- `body`: the parsed request body from the external service

`.verify()` is optional. If provided, Bourbon calls it before the handler -- return `true` to allow the request, `false` to respond with 401 automatically.



## Auth is the default
Auth-required is the default across `query` and `mutate`. Public access is always explicit -- via `query.public`, `mutate.public`, or `webhook`. This is the opposite of raw Supabase Edge Functions where forgetting an auth check silently ships an open endpoint.



## Bypassing RLS
The `db` client always enforces RLS. When you need unrestricted database access -- inviting users, writing from a webhook, admin operations -- call `db.bypassRLS()` explicitly:

```js
export const inviteUser = mutate()
  .handler(async ({ db, body }) => {
    await db.bypassRLS().auth.admin.inviteUserByEmail(body.email)
    return { success: true }
  })
```



## Caching
`query` results can be cached with a `key`. Any `mutate` that changes the underlying data declares which keys to invalidate -- Bourbon refreshes the cached result automatically.

```js
export const getPosts = query({ key: 'posts' })
  .handler(async ({ db, user }) => {
    return db.from('posts').select('*').eq('user_id', user.id)
  })

export const createPost = mutate({ invalidates: ['posts'] })
  .handler(async ({ db, user, body }) => {
    return db.from('posts').insert({ ...body, user_id: user.id })
  })
```

After `createPost` runs, `getPosts` re-fetches automatically. You never think about when to reload -- you declare the relationship, Bourbon handles the rest.



## MCP exposure
Any `query` or `mutate` can be exposed as a tool for AI agents. Set `mcp: true` and provide a `description` -- Bourbon auto-generates an MCP endpoint from the functions you opt in. MCP tools must be public.

```js
export const getPublishedPosts = query.public({
  key: 'published-posts',
  mcp: true,
  description: 'Get all published blog posts',
}).handler(async ({ db }) => {
  return db.from('posts').select('*').eq('published', true)
})
```



## Errors
Throw `BourbonError` to return a specific HTTP status code. Any other thrown error becomes a 500.

```js
import { BourbonError } from '@bourbon/core'

export const getPost = query()
  .handler(async ({ db, params }) => {
    const { data } = await db
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (!data) throw new BourbonError(404, 'Post not found')
    return data
  })
```

Common status codes: `400` bad request, `403` forbidden, `404` not found, `409` conflict, `422` unprocessable, `502` external API failed.