import type { SupabaseClient, User } from '@supabase/supabase-js'



// ----------------------------------------
// Bourbon client
// ----------------------------------------

/**
 * A Supabase client extended with Bourbon-specific methods.
 *
 * @remarks
 * You never construct this yourself -- Bourbon initializes it and injects
 * it as `db` in every handler. It behaves exactly like a standard Supabase
 * client, with one addition: `.bypassRLS()`.
 *
 * @typeParam Database - Your Supabase database types. Injected automatically
 * by `bourbon dev`. Can be ignored entirely in plain JavaScript projects.
 */
export interface BourbonClient<Database = any> extends SupabaseClient<Database> {
  /**
   * Returns a Supabase client initialized with the service role key,
   * bypassing all Row Level Security policies.
   *
   * @remarks
   * The default `db` always runs as the authenticated user (in `query` and
   * `mutate`) or as the `anon` role (in `webhook`). RLS is enforced.
   *
   * Call `.bypassRLS()` only when you genuinely need unrestricted access --
   * sending invites, writing data from a webhook with no user context,
   * or performing admin operations.
   *
   * `bourbon check` flags every `.bypassRLS()` call during CI so privileged
   * access stays visible and intentional across your codebase.
   *
   * @example Updating a contract from a webhook
   * ```js
   * export const signwellWebhook = webhook()
   *   .verify(async ({ req, body }) => verifySignWellHash(req, body))
   *   .handler(async ({ db, body }) => {
   *     const adminDb = db.bypassRLS()
   *     await adminDb
   *       .from('contracts')
   *       .update({ signed_at: body.event.time })
   *       .eq('signwell_document_id', body.data.object.id)
   *     return { received: true }
   *   })
   * ```
   *
   * @example Inviting a user by email
   * ```js
   * export const inviteUser = mutate()
   *   .handler(async ({ db, body }) => {
   *     const adminDb = db.bypassRLS()
   *     await adminDb.auth.admin.inviteUserByEmail(body.email)
   *     return { success: true }
   *   })
   * ```
   */
  bypassRLS(): SupabaseClient<Database>
}







// ----------------------------------------
// Contexts
// ----------------------------------------

/**
 * Context injected into {@link query} handlers by the Bourbon runtime.
 *
 * @remarks
 * `db` is scoped to the authenticated user -- RLS policies are enforced
 * automatically. There is no `body` here by design: queries are read-only.
 * If you need to receive data from the frontend, use {@link mutate} instead.
 *
 * @example
 * ```js
 * export const getPosts = query()
 *   .handler(async ({ db, user }) => {
 *     return db.from('posts').select('*').eq('user_id', user.id)
 *   })
 * ```
 */
export interface QueryContext<Database = any> {
  /**
   * Supabase client scoped to the authenticated user. RLS is enforced.
   *
   * Supports the full Supabase JS client API -- queries, RPCs, storage, and more.
   * Call `.bypassRLS()` on it when you need unrestricted access.
   *
   * @example
   * ```js
   * // Simple select
   * const { data } = await db.from('posts').select('*')
   *
   * // Filtered by the current user
   * const { data } = await db.from('posts').select('*').eq('user_id', user.id)
   *
   * // Calling a Postgres function
   * const { data } = await db.rpc('my_function', { param: 'value' })
   * ```
   */
  db: BourbonClient<Database>

  /**
   * The authenticated user. Always present on protected endpoints.
   * `null` when using {@link query.public} and no token is provided.
   *
   * @example
   * ```js
   * user.id    // UUID of the current user
   * user.email // email address
   * ```
   */
  user: User | null

  /**
   * URL path parameters, parsed from the route pattern.
   *
   * @example
   * ```js
   * // Route defined as: /posts/:id
   * params.id // '42' when the URL is /posts/42
   * ```
   */
  params: Record<string, string>

  /**
   * Query string values from the request URL.
   *
   * @example
   * ```js
   * // URL: /posts?page=2&limit=10
   * query.page  // '2'
   * query.limit // '10'
   * ```
   */
  query: Record<string, string>
}





/**
 * Context injected into {@link mutate} handlers by the Bourbon runtime.
 *
 * @remarks
 * `db` is scoped to the authenticated user -- RLS policies are enforced
 * automatically. Use `mutate` for anything that changes state: database
 * writes, RPC calls, external API calls, or multi-step orchestration.
 *
 * @example Basic insert
 * ```js
 * export const createPost = mutate()
 *   .handler(async ({ db, user, body }) => {
 *     return db.from('posts').insert({ ...body, user_id: user.id })
 *   })
 * ```
 *
 * @example RPC call followed by an external API call
 * ```js
 * export const createProfile = mutate({ invalidates: ['profiles'] })
 *   .handler(async ({ db, body }) => {
 *     const { data } = await db.rpc('create_profile', { name: body.name })
 *     await fetch('https://api.resend.com/emails', { ... })
 *     return { success: true, profileId: data }
 *   })
 * ```
 */
export interface MutateContext<Database = any> {
  /**
   * Supabase client scoped to the authenticated user. RLS is enforced.
   *
   * Supports the full Supabase JS client API -- queries, RPCs, storage, and more.
   * Call `.bypassRLS()` on it when you need unrestricted access.
   *
   * @example
   * ```js
   * await db.from('posts').insert({ title: body.title })
   * await db.from('posts').update({ title: body.title }).eq('id', params.id)
   * await db.from('posts').delete().eq('id', params.id)
   * await db.rpc('my_function', { param: body.value })
   * ```
   */
  db: BourbonClient<Database>

  /**
   * The authenticated user. Always present on protected endpoints.
   * `null` when using {@link mutate.public} and no token is provided.
   *
   * @example
   * ```js
   * user.id    // UUID of the current user
   * user.email // email address
   * ```
   */
  user: User | null

  /**
   * The parsed request body sent by the frontend.
   *
   * @example
   * ```js
   * // frontend calls:
   * await bourbon.call('createPost', { title: 'Hello', content: 'World' })
   *
   * // handler receives:
   * body.title   // 'Hello'
   * body.content // 'World'
   * ```
   */
  body: any

  /**
   * URL path parameters, parsed from the route pattern.
   *
   * @example
   * ```js
   * // Route defined as: /posts/:id
   * params.id // '42' when the URL is /posts/42
   * ```
   */
  params: Record<string, string>

  /**
   * Query string values from the request URL.
   *
   * @example
   * ```js
   * // URL: /posts?page=2
   * query.page // '2'
   * ```
   */
  query: Record<string, string>
}





/**
 * Context passed to the {@link WebhookBuilder.verify} function.
 *
 * @remarks
 * Return `true` to allow the request through to the handler.
 * Return `false` to reject it -- Bourbon automatically responds with 401.
 *
 * @example Verifying a Stripe webhook signature
 * ```js
 * export const stripeWebhook = webhook()
 *   .verify(async ({ req, body }) => {
 *     const sig = req.headers.get('stripe-signature')
 *     return verifyStripeSignature(sig, body)
 *   })
 *   .handler(async ({ body }) => {
 *     return { received: true }
 *   })
 * ```
 */
export interface WebhookVerifyContext {
  /**
   * The raw incoming request.
   *
   * Use it to read signature headers sent by the external service.
   *
   * @example
   * ```js
   * req.headers.get('stripe-signature')
   * req.headers.get('x-hub-signature-256') // GitHub webhooks
   * req.headers.get('x-signwell-hash')
   * ```
   */
  req: Request

  /**
   * The parsed request body from the external service.
   * Available here so you can verify the signature against the raw payload.
   */
  body: any
}





/**
 * Context injected into {@link webhook} handlers by the Bourbon runtime.
 *
 * @remarks
 * Webhooks have no user JWT -- they are called by external services, not
 * by your users. The `db` client runs as the Supabase `anon` role.
 *
 * Most webhook handlers need to write data that the anon role cannot touch.
 * Use `db.bypassRLS()` to get a service role client when needed.
 *
 * @example Receiving and acknowledging a webhook
 * ```js
 * export const stripeWebhook = webhook()
 *   .handler(async ({ body }) => {
 *     return { received: true }
 *   })
 * ```
 *
 * @example Writing to the database from a webhook
 * ```js
 * export const signwellWebhook = webhook()
 *   .verify(async ({ req, body }) => verifySignWellHash(req, body))
 *   .handler(async ({ db, body }) => {
 *     const adminDb = db.bypassRLS()
 *     await adminDb
 *       .from('contracts')
 *       .update({ signed_at: body.event.time })
 *       .eq('signwell_document_id', body.data.object.id)
 *     return { received: true }
 *   })
 * ```
 */
export interface WebhookContext {
  /**
   * Supabase client running as the `anon` role.
   *
   * RLS policies for anonymous access apply. For most webhook handlers,
   * you will need `db.bypassRLS()` to write privileged data.
   *
   * @example
   * ```js
   * // Reading public data -- anon role is fine
   * const { data } = await db.from('products').select('*').eq('id', body.productId)
   *
   * // Writing privileged data -- bypass RLS
   * const adminDb = db.bypassRLS()
   * await adminDb.from('orders').update({ status: 'paid' }).eq('id', body.orderId)
   * ```
   */
  db: BourbonClient

  /**
   * The parsed request body from the external service.
   *
   * @example
   * ```js
   * body.type              // Stripe event type e.g. 'payment_intent.succeeded'
   * body.data.object.id    // the object that triggered the event
   * ```
   */
  body: any
}
