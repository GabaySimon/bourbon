import { describe, it, expect } from 'vitest'
import { query } from '../lib/query.js'



describe('query', () => {

  // ----------------------------------------
  // Descriptor shape
  // ----------------------------------------

  it('__type is query', () => {
    const q = query().handler(async () => {})
    expect(q.__type).toBe('query')
  })

  it('__public defaults to false', () => {
    const q = query().handler(async () => {})
    expect(q.__public).toBe(false)
  })

  it('__key defaults to null', () => {
    const q = query().handler(async () => {})
    expect(q.__key).toBeNull()
  })

  it('__invalidates is always null', () => {
    const q = query().handler(async () => {})
    expect(q.__invalidates).toBeNull()
  })

  it('__mcp defaults to false', () => {
    const q = query().handler(async () => {})
    expect(q.__mcp).toBe(false)
  })

  it('__description defaults to null', () => {
    const q = query().handler(async () => {})
    expect(q.__description).toBeNull()
  })

  it('stores the handler function', () => {
    const fn = async () => {}
    const q = query().handler(fn)
    expect(q.handler).toBe(fn)
  })

  // ----------------------------------------
  // Options
  // ----------------------------------------

  it('stores key from options', () => {
    const q = query({ key: 'posts' }).handler(async () => {})
    expect(q.__key).toBe('posts')
  })

  it('stores mcp and description together', () => {
    const q = query
      .public({ mcp: true, description: 'Get all posts' })
      .handler(async () => {})
    expect(q.__mcp).toBe(true)
    expect(q.__description).toBe('Get all posts')
  })

  it('stores key alongside mcp and description', () => {
    const q = query
      .public({ key: 'posts', mcp: true, description: 'Get all posts' })
      .handler(async () => {})
    expect(q.__key).toBe('posts')
    expect(q.__mcp).toBe(true)
    expect(q.__description).toBe('Get all posts')
  })

  // ----------------------------------------
  // query.public
  // ----------------------------------------

  it('query.public sets __public to true', () => {
    const q = query.public().handler(async () => {})
    expect(q.__public).toBe(true)
  })

  it('query.public __type is still query', () => {
    const q = query.public().handler(async () => {})
    expect(q.__type).toBe('query')
  })

  it('query.public __invalidates is still null', () => {
    const q = query.public().handler(async () => {})
    expect(q.__invalidates).toBeNull()
  })

  // ----------------------------------------
  // Builder
  // ----------------------------------------

  it('query() returns a builder with a handler method', () => {
    const builder = query()
    expect(typeof builder.handler).toBe('function')
  })

  it('builder.handler returns a descriptor', () => {
    const descriptor = query().handler(async () => {})
    expect(descriptor).toHaveProperty('__type')
    expect(descriptor).toHaveProperty('__public')
    expect(descriptor).toHaveProperty('__key')
    expect(descriptor).toHaveProperty('__invalidates')
    expect(descriptor).toHaveProperty('__mcp')
    expect(descriptor).toHaveProperty('__description')
    expect(descriptor).toHaveProperty('handler')
  })

})
