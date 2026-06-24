/**
 * Options shared across {@link query} and {@link mutate}.
 *
 * @remarks
 * Not used directly -- combined into {@link QueryOptions} and {@link MutateOptions}.
 *
 * `mcp` and `description` are coupled: setting `mcp: true` requires a
 * `description`. Bourbon enforces this at the type level.
 */
export type BaseOptions =
  | { mcp?: false; description?: never }
  | { mcp: true; description: string }





/**
 * Options for {@link query}.
 *
 * @remarks
 * Pass to `query(options)` before calling `.handler()`.
 * To allow unauthenticated access, use {@link query.public} instead.
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
 *
 * @example Public with MCP exposure
 * ```js
 * export const getPublishedPosts = query.public({
 *   key: 'published-posts',
 *   mcp: true,
 *   description: 'Get all published posts',
 * }).handler(async ({ db }) => {
 *   return db.from('posts').select('*').eq('published', true)
 * })
 * ```
 */
export type QueryOptions = BaseOptions & {
  /**
   * Cache key for this query's result.
   *
   * @remarks
   * When set, Bourbon caches the response under this key. Pair with
   * {@link MutateOptions.invalidates} on any mutation that changes the
   * underlying data -- Bourbon will automatically refresh the cached
   * result after the mutation succeeds.
   *
   * On Bourbon Deploy, cache invalidation propagates across all edge
   * nodes instantly. On local dev, it uses an in-memory cache.
   *
   * @example
   * ```js
   * // api/posts.js
   * export const getPosts = query({ key: 'posts' })
   *   .handler(async ({ db, user }) => {
   *     return db.from('posts').select('*').eq('user_id', user.id)
   *   })
   *
   * export const createPost = mutate({ invalidates: ['posts'] })
   *   .handler(async ({ db, user, body }) => {
   *     return db.from('posts').insert({ ...body, user_id: user.id })
   *   })
   * // after createPost runs, getPosts re-fetches automatically
   * ```
   */
  key?: string
}





/**
 * Options for {@link mutate}.
 *
 * @remarks
 * Pass to `mutate(options)` before calling `.handler()`.
 * To allow unauthenticated access, use {@link mutate.public} instead.
 *
 * @example No options
 * ```js
 * export const createPost = mutate()
 *   .handler(async ({ db, user, body }) => {
 *     return db.from('posts').insert({ ...body, user_id: user.id })
 *   })
 * ```
 *
 * @example Invalidating a single cache key
 * ```js
 * export const createPost = mutate({ invalidates: ['posts'] })
 *   .handler(async ({ db, user, body }) => {
 *     return db.from('posts').insert({ ...body, user_id: user.id })
 *   })
 * ```
 *
 * @example Invalidating multiple keys at once
 * ```js
 * export const deletePost = mutate({ invalidates: ['posts', 'feed', 'dashboard'] })
 *   .handler(async ({ db, params }) => {
 *     return db.from('posts').delete().eq('id', params.id)
 *   })
 * ```
 */
export type MutateOptions = BaseOptions & {
  /**
   * Cache keys to invalidate after this mutation succeeds.
   *
   * @remarks
   * Accepts an array so a single write can bust multiple cached queries
   * at once. Keys must match those set via {@link QueryOptions.key}.
   *
   * On Bourbon Deploy, invalidation propagates across all edge nodes
   * automatically. On local dev, it uses an in-memory cache.
   *
   * @example
   * ```js
   * export const createComment = mutate({
   *   invalidates: ['comments', 'post-stats']
   * }).handler(async ({ db, user, body }) => {
   *   return db.from('comments').insert({ ...body, user_id: user.id })
   * })
   * ```
   */
  invalidates?: string[]
}
