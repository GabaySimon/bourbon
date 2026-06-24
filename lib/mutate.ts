import type { MutateOptions, MutateBuilder, MutateDescriptor, MutateContext } from './types/index.js'



/**
 * Define a write operation. Auth is required by default.
 *
 * @remarks
 * Returns a {@link MutateBuilder} -- call `.handler()` on it to attach
 * your function and complete the definition.
 *
 * Use `mutate` for anything that changes state -- database writes, RPC calls,
 * external API calls, or multi-step orchestration. All of these belong in
 * `mutate`, not separate primitives.
 *
 * The handler receives a {@link MutateContext} with `db`, `user`, `body`,
 * `params`, and `query`. Auth is verified automatically before the handler runs.
 *
 * To allow unauthenticated access, use {@link mutate.public} instead.
 *
 * @param options - Optional configuration. See {@link MutateOptions}.
 * @returns A {@link MutateBuilder} with a `.handler()` method.
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
 *
 * @example Upsert pattern
 * ```js
 * export const getOrCreateProfile = mutate({ invalidates: ['profiles'] })
 *   .handler(async ({ db, user }) => {
 *     const { data: existing } = await db
 *       .from('profiles')
 *       .select('id')
 *       .eq('user_id', user.id)
 *       .maybeSingle()
 *
 *     if (existing) return existing.id
 *
 *     const { data } = await db
 *       .from('profiles')
 *       .insert({ user_id: user.id })
 *       .select('id')
 *       .single()
 *
 *     return data.id
 *   })
 * ```
 *
 * @example Returning rich data
 * ```js
 * export const createContract = mutate({ invalidates: ['contracts'] })
 *   .handler(async ({ db, body }) => {
 *     const { data: existing } = await db
 *       .from('contracts')
 *       .select('id')
 *       .eq('internship_id', body.internshipId)
 *       .maybeSingle()
 *
 *     if (existing) throw new BourbonError(409, 'Contract already exists')
 *
 *     const { data: contract } = await db
 *       .from('contracts')
 *       .insert({ internship_id: body.internshipId })
 *       .select()
 *       .single()
 *
 *     return { contract, signingUrl: '...' }
 *   })
 * ```
 *
 * @see {@link mutate.public} for unauthenticated access
 * @see {@link query} for read operations
 * @see {@link webhook} for external service callbacks
 * @see {@link BourbonError} for returning specific HTTP status codes
 */
export function mutate<Database = any>(
  options: MutateOptions = {}
): MutateBuilder<Database> {
  return buildMutateBuilder<Database>(options, false)
}





/**
 * Define a public write operation. No auth required.
 *
 * @remarks
 * Identical to {@link mutate} but skips JWT verification.
 * Use this for operations that should be accessible without logging in --
 * public form submissions, contact forms, signup flows, etc.
 *
 * @param options - Optional configuration. See {@link MutateOptions}.
 * @returns A {@link MutateBuilder} with a `.handler()` method.
 *
 * @example Public form submission
 * ```js
 * export const submitContactForm = mutate.public()
 *   .handler(async ({ db, body }) => {
 *     return db.from('contact_submissions').insert({
 *       email: body.email,
 *       message: body.message,
 *     })
 *   })
 * ```
 *
 * @example Public signup
 * ```js
 * export const createAccount = mutate.public()
 *   .handler(async ({ db, body }) => {
 *     return db.from('waitlist').insert({ email: body.email })
 *   })
 * ```
 *
 * @see {@link mutate} for auth-required writes
 */
mutate.public = function <Database = any>(
  options: MutateOptions = {}
): MutateBuilder<Database> {
  return buildMutateBuilder<Database>(options, true)
}







// ----------------------------------------
// Internal
// ----------------------------------------

function buildMutateBuilder<Database = any>(
  options: MutateOptions,
  isPublic: boolean
): MutateBuilder<Database> {
  return {
    handler(fn: (ctx: MutateContext<Database>) => Promise<any>): MutateDescriptor<Database> {
      return {
        __type: 'mutate',
        __public: isPublic,
        __key: null,
        __invalidates: options.invalidates ?? null,
        __mcp: options.mcp ?? false,
        __description: options.description ?? null,
        handler: fn,
      }
    }
  }
}
