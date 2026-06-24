import { expectTypeOf } from 'vitest'
import { query } from '../lib/query.js'
import type { QueryDescriptor, QueryContext, BourbonClient } from '../lib/types/index.js'
import type { User } from '@supabase/supabase-js'

// ----------------------------------------
// Return type
// ----------------------------------------

test('query returns QueryDescriptor', () => {
  const q = query().handler(async ({ db }) => db.from('posts').select('*'))
  expectTypeOf(q).toEqualTypeOf<QueryDescriptor>()
})

test('query.public returns QueryDescriptor', () => {
  const q = query.public().handler(async ({ db }) => db.from('posts').select('*'))
  expectTypeOf(q).toEqualTypeOf<QueryDescriptor>()
})

// ----------------------------------------
// Context shape
// ----------------------------------------

test('handler receives QueryContext', () => {
  expectTypeOf(query().handler).parameter(0).toExtend<
    (ctx: QueryContext) => Promise<any>
  >()
})

test('context db is BourbonClient', () => {
  query().handler(async ({ db }) => {
    expectTypeOf(db).toEqualTypeOf<BourbonClient<any>>()
  })
})

test('context user is User | null', () => {
  query().handler(async ({ user }) => {
    expectTypeOf(user).toEqualTypeOf<User | null>()
  })
})

test('context params is Record<string, string>', () => {
  query().handler(async ({ params }) => {
    expectTypeOf(params).toEqualTypeOf<Record<string, string>>()
  })
})

test('context query is Record<string, string>', () => {
  query().handler(async ({ query }) => {
    expectTypeOf(query).toEqualTypeOf<Record<string, string>>()
  })
})

// ----------------------------------------
// QueryContext does not have body
// ----------------------------------------

test('context does not have body', () => {
  query().handler(async (ctx) => {
    // @ts-expect-error body does not exist on QueryContext
    ctx.body
  })
})

// ----------------------------------------
// Options validation
// ----------------------------------------

test('unknown options are rejected', () => {
  // @ts-expect-error unknown is not a valid option
  query({ unknown: true })
})

test('key must be a string not a number', () => {
  // @ts-expect-error key must be string
  query({ key: 42 })
})

test('invalidates is not a valid query option', () => {
  // @ts-expect-error invalidates belongs on mutate not query
  query({ invalidates: ['posts'] })
})

// ----------------------------------------
// MCP discriminated union
// ----------------------------------------

test('mcp true requires description', () => {
  // @ts-expect-error description is required when mcp is true
  query({ mcp: true })
})

test('mcp true with description is valid', () => {
  query.public({ mcp: true, description: 'Get all posts' })
})

test('description without mcp true is rejected', () => {
  // @ts-expect-error description requires mcp: true
  query({ description: 'Get all posts' })
})

test('mcp false without description is valid', () => {
  query({ mcp: false })
})

test('mcp omitted is valid', () => {
  query({})
})
