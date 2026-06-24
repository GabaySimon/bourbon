# Architecture
A high-level view of what Bourbon is & how the pieces fit together. For folder structure see [conventions](./conventions.md); for the core functions see [primitives](./primitives.md).



## What Bourbon is
A library and a framework in one repo.

- **`@bourbon/core`** · the functions you import: 
  `query`, `mutate`, `webhook`, the router, and components.
- **The CLI** · conventions, scaffolding, and the dev server that ties a project together.



## The stack
Bourbon sits on top of proven tools rather than reinventing them:
- **Vite**         frontend dev server and build
- **Vanilla JS**   no React, no JSX, no virtual DOM on the frontend
- **Supabase**     database, auth, and Edge Functions (the backend)
- **Hono**         the router that powers Bourbon's runtime internally
- **Lit**          the thin layer behind Bourbon's components

You write plain JavaScript. Bourbon wires these together underneath.



## How a request flows
```
Browser
  │  bourbon.call('getPosts')
  ▼
Bourbon runtime               ← verifies auth, initializes Supabase, runs middleware
  │
  ▼
Your handler in api/posts.js  ← the code you actually wrote
  │
  ▼
Bourbon runtime               ← formats response, handles errors, manages cache
  │
  ▼
Browser                       ← gets clean data back
```

The runtime is the "reception desk" every request passes through. It does the repetitive, security-critical work once so you never write it per function.



## Frontend vs backend
A clean split, enforced by where files live:

- **`api/`** runs on the server (Supabase Edge Functions). All data access and server-side operations go here. Secure by default.
- **`public/`** runs in the browser. Views, components, styles, and pure helper functions.

The frontend never talks to Supabase directly. It calls Bourbon, which runs your server-side handlers as Edge Functions -- serverless, globally distributed, and zero infrastructure to maintain. No Express server, no Node process to keep alive, no deployment pipeline to configure. You write the logic, Supabase runs it.



## The runtime abstraction
A raw Supabase Edge Function is ~40 lines: Deno server setup, auth verification, client initialization, error handling (almost all of it identical between functions).

Bourbon generates that boilerplate for you. You write only the handler body. The generated Deno code lives in `.output/` (gitignored) and is rebuilt on every `bourbon dev`.

This is the core value: **you edit the logic, Bourbon handles the plumbing.**