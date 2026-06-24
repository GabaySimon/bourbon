/**
 * An error with an associated HTTP status code.
 *
 * @remarks
 * Throw this inside any handler to return a specific HTTP status code
 * to the frontend. Bourbon catches it automatically and sends the right
 * response -- you never need to construct `Response.json()` yourself.
 *
 * Any other thrown error becomes a 500 Internal Server Error. The error
 * message is never exposed to the frontend in production -- only the
 * status code and a generic message are sent.
 *
 * @example Not found (JavaScript)
 * ```js
 * import { BourbonError } from '@bourbon/core'
 *
 * export const getPost = query()
 *   .handler(async ({ db, params }) => {
 *     const { data } = await db
 *       .from('posts')
 *       .select('*')
 *       .eq('id', params.id)
 *       .maybeSingle()
 *
 *     if (!data) throw new BourbonError(404, 'Post not found')
 *     return data
 *   })
 * ```
 *
 * @example Forbidden (JavaScript)
 * ```js
 * import { BourbonError } from '@bourbon/core'
 *
 * export const deletePost = mutate()
 *   .handler(async ({ db, user, params }) => {
 *     const { data: post } = await db
 *       .from('posts')
 *       .select('user_id')
 *       .eq('id', params.id)
 *       .single()
 *
 *     if (post.user_id !== user.id) throw new BourbonError(403, 'Forbidden')
 *
 *     return db.from('posts').delete().eq('id', params.id)
 *   })
 * ```
 *
 * @example Conflict (JavaScript)
 * ```js
 * import { BourbonError } from '@bourbon/core'
 *
 * export const createContract = mutate()
 *   .handler(async ({ db, body }) => {
 *     const { data: existing } = await db
 *       .from('contracts')
 *       .select('id')
 *       .eq('internship_id', body.internshipId)
 *       .maybeSingle()
 *
 *     if (existing) throw new BourbonError(409, 'Contract already exists')
 *
 *     return db.from('contracts').insert(body)
 *   })
 * ```
 *
 * @example Common status codes
 * ```js
 * throw new BourbonError(400, 'Bad request')       // invalid input
 * throw new BourbonError(403, 'Forbidden')          // not allowed
 * throw new BourbonError(404, 'Not found')          // resource missing
 * throw new BourbonError(409, 'Conflict')           // already exists
 * throw new BourbonError(422, 'Unprocessable')      // validation failed
 * throw new BourbonError(502, 'Bad gateway')        // external API failed
 * ```
 */
export class BourbonError extends Error {
  /**
   * The HTTP status code returned to the frontend.
   * e.g. `400`, `403`, `404`, `409`, `422`, `502`.
   */
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BourbonError'
    this.status = status
  }
}