import type { WebhookBuilder, WebhookDescriptor, WebhookContext, WebhookVerifyContext } from './types/index.js'



/**
 * Define a webhook endpoint. Always public -- external services do not send user JWTs.
 *
 * @remarks
 * Returns a {@link WebhookBuilder} -- optionally call `.verify()` to attach
 * signature verification, then call `.handler()` to complete the definition.
 *
 * Use `webhook` for callbacks from external services like Stripe, SignWell,
 * GitHub, or any third party that sends HTTP events to your app.
 *
 * Unlike {@link query} and {@link mutate}, webhooks:
 * - Are always public -- no JWT verification
 * - Have no `user` in context -- the caller is an external service, not a user
 * - Should verify the request signature via `.verify()` before trusting the payload
 * - The `db` client runs as the `anon` role -- use `db.bypassRLS()` when you need service role access
 *
 * @returns A {@link WebhookBuilder} with `.verify()` and `.handler()` methods.
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
 * @example Writing privileged data
 * ```js
 * export const signwellWebhook = webhook()
 *   .verify(async ({ req, body }) => {
 *     return verifySignWellHash(
 *       body.event.type,
 *       body.event.time,
 *       req.headers.get('x-signwell-hash')
 *     )
 *   })
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
 * @example Handling specific event types
 * ```js
 * export const stripeWebhook = webhook()
 *   .verify(async ({ req, body }) => verifyStripeSignature(req, body))
 *   .handler(async ({ db, body }) => {
 *     if (body.type !== 'payment_intent.succeeded') {
 *       return { received: true }
 *     }
 *
 *     const adminDb = db.bypassRLS()
 *     await adminDb
 *       .from('orders')
 *       .update({ status: 'paid' })
 *       .eq('stripe_payment_intent_id', body.data.object.id)
 *
 *     return { received: true }
 *   })
 * ```
 *
 * @see {@link query} for authenticated read operations
 * @see {@link mutate} for authenticated write operations
 * @see {@link BourbonError} for returning specific HTTP status codes
 */
export function webhook(): WebhookBuilder {
  return buildWebhookBuilder(null)
}







// ----------------------------------------
// Internal
// ----------------------------------------

function buildWebhookBuilder(
  verifyFn: ((ctx: WebhookVerifyContext) => Promise<boolean>) | null
): WebhookBuilder {
  return {
    verify(fn: (ctx: WebhookVerifyContext) => Promise<boolean>): WebhookBuilder {
      return buildWebhookBuilder(fn)
    },

    handler(fn: (ctx: WebhookContext) => Promise<any>): WebhookDescriptor {
      return {
        __type: 'webhook',
        __public: true,
        __key: null,
        __invalidates: null,
        __mcp: false,
        __description: null,
        __verify: verifyFn,
        handler: fn,
      }
    }
  }
}
