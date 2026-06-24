import type { QueryContext, MutateContext, WebhookContext, WebhookVerifyContext } from './contexts.js'
import type { QueryDescriptor, MutateDescriptor, WebhookDescriptor } from './descriptors.js'



/**
 * Builder returned by {@link query} and {@link query.public}.
 *
 * @remarks
 * Call `.handler()` to attach the handler and produce a
 * {@link QueryDescriptor} consumed by the Bourbon runtime.
 *
 * You never construct this directly -- it is returned by `query()`.
 *
 * @example No options
 * ```js
 * export const getPosts = query()
 *   .handler(async ({ db, user }) => {
 *     return db.from('posts').select('*').eq('user_id', user.id)
 *   })
 * ```
 *
 * @example With caching
 * ```js
 * export const getPosts = query({ key: 'posts' })
 *   .handler(async ({ db, user }) => {
 *     return db.from('posts').select('*').eq('user_id', user.id)
 *   })
 * ```
 */
export interface QueryBuilder<Database = any> {
  /**
   * Attach the handler function to this query.
   *
   * @remarks
   * The handler receives a {@link QueryContext} with `db`, `user`, `params`,
   * and `query`. Auth is verified automatically -- you never check the JWT yourself.
   *
   * Return any serializable value -- it is sent to the frontend as JSON.
   * Throw a {@link BourbonError} to return a specific HTTP status code.
   *
   * @param fn - The function to run when this endpoint is called.
   * @returns A {@link QueryDescriptor} consumed by the Bourbon runtime.
   *
   * @example
   * ```js
   * export const getPost = query()
   *   .handler(async ({ db, params }) => {
   *     const { data } = await db
   *       .from('posts')
   *       .select('*')
   *       .eq('id', params.id)
   *       .single()
   *     return data
   *   })
   * ```
   */
  handler(
    fn: (ctx: QueryContext<Database>) => Promise<any>
  ): QueryDescriptor<Database>
}





/**
 * Builder returned by {@link mutate} and {@link mutate.public}.
 *
 * @remarks
 * Call `.handler()` to attach the handler and produce a
 * {@link MutateDescriptor} consumed by the Bourbon runtime.
 *
 * You never construct this directly -- it is returned by `mutate()`.
 *
 * @example Basic write
 * ```js
 * export const createPost = mutate()
 *   .handler(async ({ db, user, body }) => {
 *     return db.from('posts').insert({ ...body, user_id: user.id })
 *   })
 * ```
 *
 * @example With cache invalidation
 * ```js
 * export const createPost = mutate({ invalidates: ['posts'] })
 *   .handler(async ({ db, user, body }) => {
 *     return db.from('posts').insert({ ...body, user_id: user.id })
 *   })
 * ```
 *
 * @example RPC call with external API
 * ```js
 * export const createProfile = mutate({ invalidates: ['profiles'] })
 *   .handler(async ({ db, body }) => {
 *     const { data } = await db.rpc('create_profile', { name: body.name })
 *     await fetch('https://api.resend.com/emails', { ... })
 *     return { success: true, profileId: data }
 *   })
 * ```
 */
export interface MutateBuilder<Database = any> {
  /**
   * Attach the handler function to this mutation.
   *
   * @remarks
   * The handler receives a {@link MutateContext} with `db`, `user`, `body`,
   * `params`, and `query`. Auth is verified automatically.
   *
   * Return any serializable value -- it is sent to the frontend as JSON.
   * Throw a {@link BourbonError} to return a specific HTTP status code.
   *
   * @param fn - The function to run when this endpoint is called.
   * @returns A {@link MutateDescriptor} consumed by the Bourbon runtime.
   *
   * @example
   * ```js
   * export const deletePost = mutate({ invalidates: ['posts'] })
   *   .handler(async ({ db, user, params }) => {
   *     return db
   *       .from('posts')
   *       .delete()
   *       .eq('id', params.id)
   *       .eq('user_id', user.id)
   *   })
   * ```
   */
  handler(
    fn: (ctx: MutateContext<Database>) => Promise<any>
  ): MutateDescriptor<Database>
}





/**
 * Builder returned by {@link webhook}.
 *
 * @remarks
 * Optionally call `.verify()` to attach signature verification, then call
 * `.handler()` to complete the definition.
 *
 * You never construct this directly -- it is returned by `webhook()`.
 *
 * @example Without verification
 * ```js
 * export const myWebhook = webhook()
 *   .handler(async ({ body }) => {
 *     return { received: true }
 *   })
 * ```
 *
 * @example With signature verification
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
 *
 * @example Writing to the database
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
export interface WebhookBuilder {
  /**
   * Attach a signature verification function.
   *
   * @remarks
   * Called before the handler runs. Return `true` to allow the request,
   * `false` to automatically respond with 401 Unauthorized.
   *
   * Skip entirely if the webhook source does not provide signatures.
   *
   * @param fn - Receives {@link WebhookVerifyContext}: `req` and `body`.
   * @returns The same {@link WebhookBuilder} for chaining `.handler()`.
   *
   * @example
   * ```js
   * .verify(async ({ req, body }) => {
   *   const sig = req.headers.get('stripe-signature')
   *   return verifyStripeSignature(sig, body)
   * })
   * ```
   */
  verify(
    fn: (ctx: WebhookVerifyContext) => Promise<boolean>
  ): WebhookBuilder

  /**
   * Attach the handler function to this webhook.
   *
   * @remarks
   * The handler receives a {@link WebhookContext} with `db` and `body`.
   * There is no `user` -- webhooks are called by external services, not users.
   *
   * Return any serializable value -- it is sent back to the caller as JSON.
   * Most webhook providers expect `{ received: true }` on success.
   *
   * @param fn - The function to run when this webhook fires.
   * @returns A {@link WebhookDescriptor} consumed by the Bourbon runtime.
   */
  handler(
    fn: (ctx: WebhookContext) => Promise<any>
  ): WebhookDescriptor
}
