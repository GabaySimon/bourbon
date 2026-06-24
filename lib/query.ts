import type { QueryOptions, QueryBuilder, QueryDescriptor, QueryContext } from './types/index.js'



/**
 * Define a read operation. Auth is required by default.
 *
 * @remarks
 * Returns a {@link QueryBuilder} -- call `.handler()` on it to attach
 * your function and complete the definition.
 *
 * The handler receives a {@link QueryContext} with `db`, `user`, `params`,
 * and `query`. Auth is verified automatically before the handler runs.
 *
 * To allow unauthenticated access, use {@link query.public} instead.
 *
 * @param options - Optional configuration. See {@link QueryOptions}.
 * @returns A {@link QueryBuilder} with a `.handler()` method.
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
 *
 * @see {@link query.public} for unauthenticated access
 * @see {@link mutate} for write operations
 * @see {@link BourbonError} for returning specific HTTP status codes
 */
export function query<Database = any>(
  options: QueryOptions = {}
): QueryBuilder<Database> {
  return buildQueryBuilder<Database>(options, false)
}





/**
 * Define a public read operation. No auth required.
 *
 * @remarks
 * Identical to {@link query} but skips JWT verification.
 * Use for endpoints that should be accessible without logging in --
 * public blog posts, product listings, landing page data, etc.
 *
 * @param options - Optional configuration. See {@link QueryOptions}.
 * @returns A {@link QueryBuilder} with a `.handler()` method.
 *
 * @example
 * ```js
 * export const getPublishedPosts = query.public({ key: 'published-posts' })
 *   .handler(async ({ db }) => {
 *     return db.from('posts').select('*').eq('published', true)
 *   })
 * ```
 *
 * @see {@link query} for auth-required reads
 */
query.public = function <Database = any>(
  options: QueryOptions = {}
): QueryBuilder<Database> {
  return buildQueryBuilder<Database>(options, true)
}







// ----------------------------------------
// Internal
// ----------------------------------------

function buildQueryBuilder<Database = any>(
  options: QueryOptions,
  isPublic: boolean
): QueryBuilder<Database> {
  return {
    handler(fn: (ctx: QueryContext<Database>) => Promise<any>): QueryDescriptor<Database> {
      return {
        __type: 'query',
        __public: isPublic,
        __key: options.key ?? null,
        __invalidates: null,
        __mcp: options.mcp ?? false,
        __description: options.description ?? null,
        handler: fn,
      }
    }
  }
}
