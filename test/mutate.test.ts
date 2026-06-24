import { describe, it, expect } from 'vitest'
import { mutate } from '../lib/mutate.js'

describe('mutate', () => {

  // ----------------------------------------
  // Descriptor shape
  // ----------------------------------------

  it('__type is mutate', () => {
    const m = mutate().handler(async () => {})
    expect(m.__type).toBe('mutate')
  })

  it('__public defaults to false', () => {
    const m = mutate().handler(async () => {})
    expect(m.__public).toBe(false)
  })

  it('__key is always null', () => {
    const m = mutate().handler(async () => {})
    expect(m.__key).toBeNull()
  })

  it('__invalidates defaults to null', () => {
    const m = mutate().handler(async () => {})
    expect(m.__invalidates).toBeNull()
  })

  it('__mcp defaults to false', () => {
    const m = mutate().handler(async () => {})
    expect(m.__mcp).toBe(false)
  })

  it('__description defaults to null', () => {
    const m = mutate().handler(async () => {})
    expect(m.__description).toBeNull()
  })

  it('stores the handler function', () => {
    const fn = async () => {}
    const m = mutate().handler(fn)
    expect(m.handler).toBe(fn)
  })

  // ----------------------------------------
  // Options
  // ----------------------------------------

  it('stores invalidates from options', () => {
    const m = mutate({ invalidates: ['posts'] }).handler(async () => {})
    expect(m.__invalidates).toEqual(['posts'])
  })

  it('stores multiple invalidates keys', () => {
    const m = mutate({ invalidates: ['posts', 'feed', 'dashboard'] }).handler(async () => {})
    expect(m.__invalidates).toEqual(['posts', 'feed', 'dashboard'])
  })

  it('stores mcp and description together', () => {
    const m = mutate
      .public({ mcp: true, description: 'Create a post' })
      .handler(async () => {})
    expect(m.__mcp).toBe(true)
    expect(m.__description).toBe('Create a post')
  })

  it('stores invalidates alongside mcp and description', () => {
    const m = mutate
      .public({ invalidates: ['posts'], mcp: true, description: 'Create a post' })
      .handler(async () => {})
    expect(m.__invalidates).toEqual(['posts'])
    expect(m.__mcp).toBe(true)
    expect(m.__description).toBe('Create a post')
  })

  // ----------------------------------------
  // mutate.public
  // ----------------------------------------

  it('mutate.public sets __public to true', () => {
    const m = mutate.public().handler(async () => {})
    expect(m.__public).toBe(true)
  })

  it('mutate.public __type is still mutate', () => {
    const m = mutate.public().handler(async () => {})
    expect(m.__type).toBe('mutate')
  })

  it('mutate.public __key is still null', () => {
    const m = mutate.public().handler(async () => {})
    expect(m.__key).toBeNull()
  })

  // ----------------------------------------
  // Builder
  // ----------------------------------------

  it('mutate() returns a builder with a handler method', () => {
    const builder = mutate()
    expect(typeof builder.handler).toBe('function')
  })

  it('builder.handler returns a descriptor', () => {
    const descriptor = mutate().handler(async () => {})
    expect(descriptor).toHaveProperty('__type')
    expect(descriptor).toHaveProperty('__public')
    expect(descriptor).toHaveProperty('__key')
    expect(descriptor).toHaveProperty('__invalidates')
    expect(descriptor).toHaveProperty('__mcp')
    expect(descriptor).toHaveProperty('__description')
    expect(descriptor).toHaveProperty('handler')
  })

})
