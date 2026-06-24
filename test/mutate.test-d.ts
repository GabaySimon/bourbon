import { expectTypeOf } from 'vitest'
import { mutate } from '../lib/mutate.js'
import type { MutateDescriptor, MutateContext, BourbonClient } from '../lib/types/index.js'
import type { User } from '@supabase/supabase-js'

// ----------------------------------------
// Return type
// ----------------------------------------

test('mutate returns MutateDescriptor', () => {
  const m = mutate().handler(async ({ db }) => db.from('posts').select('*'))
  expectTypeOf(m).toEqualTypeOf<MutateDescriptor>()
})

test('mutate.public returns MutateDescriptor', () => {
  const m = mutate.public().handler(async ({ db }) => db.from('posts').select('*'))
  expectTypeOf(m).toEqualTypeOf<MutateDescriptor>()
})

// ----------------------------------------
// Context shape
// ----------------------------------------

test('handler receives MutateContext', () => {
  expectTypeOf(mutate().handler).parameter(0).toExtend<
    (ctx: MutateContext) => Promise<any>
  >()
})

test('context db is BourbonClient', () => {
  mutate().handler(async ({ db }) => {
    expectTypeOf(db).toEqualTypeOf<BourbonClient<any>>()
  })
})

test('context user is User | null', () => {
  mutate().handler(async ({ user }) => {
    expectTypeOf(user).toEqualTypeOf<User | null>()
  })
})

test('context body is any', () => {
  mutate().handler(async ({ body }) => {
    expectTypeOf(body).toBeAny()
  })
})

test('context params is Record<string, string>', () => {
  mutate().handler(async ({ params }) => {
    expectTypeOf(params).toEqualTypeOf<Record<string, string>>()
  })
})

test('context query is Record<string, string>', () => {
  mutate().handler(async ({ query }) => {
    expectTypeOf(query).toEqualTypeOf<Record<string, string>>()
  })
})

// ----------------------------------------
// Options validation
// ----------------------------------------

test('unknown options are rejected', () => {
  // @ts-expect-error unknown is not a valid option
  mutate({ unknown: true })
})

test('invalidates must be string array not string', () => {
  // @ts-expect-error invalidates must be string[] not string
  mutate({ invalidates: 'posts' })
})

test('invalidates must be string array not number array', () => {
  // @ts-expect-error invalidates must be string[]
  mutate({ invalidates: [1, 2, 3] })
})

test('key is not a valid mutate option', () => {
  // @ts-expect-error key belongs on query not mutate
  mutate({ key: 'posts' })
})

// ----------------------------------------
// MCP discriminated union
// ----------------------------------------

test('mcp true requires description', () => {
  // @ts-expect-error description is required when mcp is true
  mutate({ mcp: true })
})

test('mcp true with description is valid', () => {
  mutate.public({ mcp: true, description: 'Create a new post' })
})

test('description without mcp true is rejected', () => {
  // @ts-expect-error description requires mcp: true
  mutate({ description: 'Create a new post' })
})

test('mcp false without description is valid', () => {
  mutate({ mcp: false })
})

test('mcp omitted is valid', () => {
  mutate({})
})

test('invalidates and mcp together are valid', () => {
  mutate.public({
    invalidates: ['posts'],
    mcp: true,
    description: 'Create a new post',
  })
})
