import { describe, it, expect } from 'vitest'
import { webhook } from '../lib/webhook.js'

describe('webhook', () => {

  // ----------------------------------------
  // Descriptor shape
  // ----------------------------------------

  it('__type is webhook', () => {
    const w = webhook().handler(async () => {})
    expect(w.__type).toBe('webhook')
  })

  it('__public is always true', () => {
    const w = webhook().handler(async () => {})
    expect(w.__public).toBe(true)
  })

  it('__key is always null', () => {
    const w = webhook().handler(async () => {})
    expect(w.__key).toBeNull()
  })

  it('__invalidates is always null', () => {
    const w = webhook().handler(async () => {})
    expect(w.__invalidates).toBeNull()
  })

  it('__mcp is always false', () => {
    const w = webhook().handler(async () => {})
    expect(w.__mcp).toBe(false)
  })

  it('__description is always null', () => {
    const w = webhook().handler(async () => {})
    expect(w.__description).toBeNull()
  })

  it('__verify defaults to null when no verify function provided', () => {
    const w = webhook().handler(async () => {})
    expect(w.__verify).toBeNull()
  })

  it('stores the handler function', () => {
    const fn = async () => {}
    const w = webhook().handler(fn)
    expect(w.handler).toBe(fn)
  })

  // ----------------------------------------
  // verify
  // ----------------------------------------

  it('stores the verify function in __verify', () => {
    const verifyFn = async () => true
    const w = webhook().verify(verifyFn).handler(async () => {})
    expect(w.__verify).toBe(verifyFn)
  })

  it('verify returns a builder with a handler method', () => {
    const builder = webhook().verify(async () => true)
    expect(typeof builder.handler).toBe('function')
  })

  it('verify returns a builder with a verify method', () => {
    const builder = webhook().verify(async () => true)
    expect(typeof builder.verify).toBe('function')
  })

  // ----------------------------------------
  // Builder
  // ----------------------------------------

  it('webhook() returns a builder with a handler method', () => {
    const builder = webhook()
    expect(typeof builder.handler).toBe('function')
  })

  it('webhook() returns a builder with a verify method', () => {
    const builder = webhook()
    expect(typeof builder.verify).toBe('function')
  })

  it('builder.handler returns a descriptor', () => {
    const descriptor = webhook().handler(async () => {})
    expect(descriptor).toHaveProperty('__type')
    expect(descriptor).toHaveProperty('__public')
    expect(descriptor).toHaveProperty('__key')
    expect(descriptor).toHaveProperty('__invalidates')
    expect(descriptor).toHaveProperty('__mcp')
    expect(descriptor).toHaveProperty('__description')
    expect(descriptor).toHaveProperty('__verify')
    expect(descriptor).toHaveProperty('handler')
  })

})
