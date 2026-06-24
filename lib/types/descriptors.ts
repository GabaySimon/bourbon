import type { QueryContext, MutateContext, WebhookContext, WebhookVerifyContext } from './contexts.js'



/**
 * The descriptor returned when a {@link QueryBuilder} is fully configured.
 *
 * @remarks
 * An internal contract between the library and the Bourbon runtime.
 * You never construct or interact with this directly -- it is produced
 * by calling `.handler()` on a {@link QueryBuilder} and consumed by
 * the Bourbon CLI and runtime to generate the correct Edge Function.
 *
 * @typeParam Database - Passed through from the `query` call.
 */
export interface QueryDescriptor<Database = any> {
  /** @internal */
  __type: 'query'
  /** @internal */
  __public: boolean
  /** @internal */
  __key: string | null
  /** @internal */
  __invalidates: null
  /** @internal */
  __mcp: boolean
  /** @internal */
  __description: string | null
  /** @internal */
  handler: (ctx: QueryContext<Database>) => Promise<any>
}





/**
 * The descriptor returned when a {@link MutateBuilder} is fully configured.
 *
 * @remarks
 * An internal contract between the library and the Bourbon runtime.
 * You never construct or interact with this directly -- it is produced
 * by calling `.handler()` on a {@link MutateBuilder} and consumed by
 * the Bourbon CLI and runtime to generate the correct Edge Function.
 *
 * @typeParam Database - Passed through from the `mutate` call.
 */
export interface MutateDescriptor<Database = any> {
  /** @internal */
  __type: 'mutate'
  /** @internal */
  __public: boolean
  /** @internal */
  __key: null
  /** @internal */
  __invalidates: string[] | null
  /** @internal */
  __mcp: boolean
  /** @internal */
  __description: string | null
  /** @internal */
  handler: (ctx: MutateContext<Database>) => Promise<any>
}





/**
 * The descriptor returned when a {@link WebhookBuilder} is fully configured.
 *
 * @remarks
 * An internal contract between the library and the Bourbon runtime.
 * You never construct or interact with this directly -- it is produced
 * by calling `.handler()` on a {@link WebhookBuilder} and consumed by
 * the Bourbon CLI and runtime to generate the correct Edge Function.
 *
 * Webhooks are always public -- external services do not send user JWTs.
 * Security is handled via {@link WebhookBuilder.verify} instead of
 * Bourbon's standard JWT auth layer.
 */
export interface WebhookDescriptor {
  /** @internal */
  __type: 'webhook'
  /** @internal */
  __public: true
  /** @internal */
  __key: null
  /** @internal */
  __invalidates: null
  /** @internal */
  __mcp: false
  /** @internal */
  __description: null
  /** @internal */
  __verify: ((ctx: WebhookVerifyContext) => Promise<boolean>) | null
  /** @internal */
  handler: (ctx: WebhookContext) => Promise<any>
}





/**
 * Union of all Bourbon descriptors.
 *
 * @remarks
 * Used internally by the Bourbon CLI and runtime to handle any descriptor
 * produced by {@link query}, {@link mutate}, or {@link webhook}.
 * Not intended for direct use.
 */
export type AnyDescriptor =
  | QueryDescriptor<any>
  | MutateDescriptor<any>
  | WebhookDescriptor
