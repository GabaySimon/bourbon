// ----------------------------------------
// Platform detection
// ----------------------------------------

const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.platform)





// ----------------------------------------
// Shortcut registry
// ----------------------------------------
// No matter how many components declare shortcuts, Bourbon registers
// exactly one keydown listener on the document. All key events are
// routed here and dispatched to the right component instance.

type ShortcutEntry = { instance: any; method: string }
type ShortcutRegistry = Map<string, ShortcutEntry[]>

const registry: ShortcutRegistry = new Map()

document.addEventListener('keydown', (e: KeyboardEvent) => {

  // Build the key string from the event.
  // Single character keys are uppercased so 'k' and 'K' both match 'K'.
  // e.g. $mod+K, Ctrl+Enter, Escape
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey) parts.push('Alt')
  if (e.metaKey) parts.push('Meta')
  const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key
  parts.push(keyName)
  const key = parts.join('+')

  const handlers = registry.get(key)
  if (!handlers || handlers.length === 0) return

  // If the user is typing in an input, textarea or select,
  // only allow safe keys: Escape, function keys, modifier combos.
  // Single letter or number shortcuts are suppressed while typing.
  const active = document.activeElement
  const isTyping = (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  )
  const isSafeKey = (
    e.ctrlKey || e.metaKey || e.altKey ||
    e.key === 'Escape' ||
    (e.key.startsWith('F') && e.key.length > 1)
  )

  if (isTyping && !isSafeKey) return

  // Last registered wins -- most recently mounted component gets priority.
  const { instance, method } = handlers[handlers.length - 1]
  const handler = instance[method]
  if (typeof handler === 'function') {
    handler.call(instance, e)
  }

})





// ----------------------------------------
// Key normalization
// ----------------------------------------

function normalizeShortcut(shortcut: string): string {
  return shortcut
    // $mod resolves to Cmd on Apple devices and Ctrl elsewhere
    .replace('$mod', isApple ? 'Meta' : 'Ctrl')
    // Uppercase single char keys e.g. +k -> +K
    .replace(/\+([a-z])$/, (_, k) => `+${k.toUpperCase()}`)
}





// ----------------------------------------
// Register / unregister
// ----------------------------------------

export function registerShortcuts(
  shortcuts: Record<string, string>,
  instance: any
): void {
  for (const [key, method] of Object.entries(shortcuts)) {
    const normalizedKey = normalizeShortcut(key)
    if (!registry.has(normalizedKey)) registry.set(normalizedKey, [])
    registry.get(normalizedKey)!.push({ instance, method })
  }
}



export function unregisterShortcuts(instance: any): void {
  for (const [key, handlers] of registry.entries()) {
    const filtered = handlers.filter(h => h.instance !== instance)
    if (filtered.length === 0) {
      registry.delete(key)
    } else {
      registry.set(key, filtered)
    }
  }
}
