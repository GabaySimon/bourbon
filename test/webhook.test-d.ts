import { expectTypeOf } from 'vitest'
import { webhook } from '../lib/webhook.js'
import type { WebhookDescriptor, WebhookBuilder, WebhookContext } from '../lib/types/index.js'
import type { BourbonClient } from '../lib/types/index.js'

// ----------------------------------------
// Return types
// ----------------------------------------

test('webhook() returns a WebhookBuilder', () => {
  expectTypeOf(webhook()).toEqualTypeOf<WebhookBuilder>()
})

test('webhook().verify() returns a WebhookBuilder', () => {
  expectTypeOf(webhook().verify(async () => true)).toEqualTypeOf<WebhookBuilder>()
})

test('webhook().handler() returns a WebhookDescriptor', () => {
  const w = webhook().handler(async ({ body }) => ({ received: true }))
  expectTypeOf(w).toEqualTypeOf<WebhookDescriptor>()
})

test('webhook().verify().handler() returns a WebhookDescriptor', () => {
  const w = webhook()
    .verify(async () => true)
    .handler(async ({ body }) => ({ received: true }))
  expectTypeOf(w).toEqualTypeOf<WebhookDescriptor>()
})

// ----------------------------------------
// Context shape
// ----------------------------------------

test('handler receives WebhookContext', () => {
  expectTypeOf(webhook().handler).parameter(0).toExtend<
    (ctx: WebhookContext) => Promise<any>
  >()
})

test('context db is BourbonClient', () => {
  webhook().handler(async ({ db }) => {
    expectTypeOf(db).toEqualTypeOf<BourbonClient>()
  })
})

test('context body is any', () => {
  webhook().handler(async ({ body }) => {
    expectTypeOf(body).toBeAny()
  })
})

// ----------------------------------------
// WebhookContext does not have user, params, or query
// ----------------------------------------

test('context does not have user', () => {
  webhook().handler(async (ctx) => {
    // @ts-expect-error user does not exist on WebhookContext
    ctx.user
  })
})

test('context does not have params', () => {
  webhook().handler(async (ctx) => {
    // @ts-expect-error params does not exist on WebhookContext
    ctx.params
  })
})

test('context does not have query', () => {
  webhook().handler(async (ctx) => {
    // @ts-expect-error query does not exist on WebhookContext
    ctx.query
  })
})

// ----------------------------------------
// verify context shape
// ----------------------------------------

test('verify receives req and body', () => {
  webhook().verify(async ({ req, body }) => {
    expectTypeOf(req).toEqualTypeOf<Request>()
    expectTypeOf(body).toBeAny()
    return true
  })
})

test('verify must return a boolean', () => {
  // @ts-expect-error verify must return Promise<boolean> not Promise<void>
  webhook().verify(async () => {})
})

// ----------------------------------------
// webhook takes no arguments
// ----------------------------------------

test('webhook takes no arguments', () => {
  // @ts-expect-error webhook takes no options
  webhook({ key: 'posts' })
})
