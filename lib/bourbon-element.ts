import { LitElement, PropertyValues } from 'lit'
import { registerShortcuts, unregisterShortcuts } from './shortcuts.js'



/**
 * Internal base class shared by {@link component} and {@link view}.
 *
 * @remarks
 * Never extend this directly. Use {@link component} for reusable UI
 * elements and {@link view} for page-level orchestration.
 *
 * @internal
 */
export class BourbonElement extends LitElement {





  // ----------------------------------------
  // Static declarations
  // ----------------------------------------

  /**
   * Shared stylesheets to inject into this component's Shadow DOM.
   *
   * @remarks
   * Import stylesheet files from `public/styles/shared/` at the top
   * of your component file and list them here. The browser parses each
   * stylesheet once and shares the same object across every component
   * that adopts it -- more efficient than duplicating the same CSS
   * across multiple `static styles` blocks.
   *
   * Note: not useful on {@link view} since Shadow DOM is disabled there
   * and global styles already apply.
   *
   * @example
   * ```js
   * import cardStyles from '../styles/shared/cards.css'
   *
   * class StudentCard extends component {
   *   static adopt = [cardStyles]
   * }
   * ```
   */
  static adopt: CSSStyleSheet[] = []



  /**
   * Keyboard shortcuts for this component.
   *
   * @remarks
   * Keys use the format `'Modifier+Key'` or just `'Key'`.
   * Modifiers: `Ctrl`, `Shift`, `Alt`, `Meta` (Cmd on Mac).
   * Use `$mod` for cross-platform shortcuts -- resolves to `Ctrl`
   * on Windows/Linux and `Cmd` on Apple devices.
   *
   * Bourbon registers one global keyboard listener for the entire app
   * and routes key events to the right component automatically.
   * Shortcuts are active while this component is in the DOM.
   *
   * When multiple instances register the same shortcut, the most
   * recently mounted one handles it -- correct behavior for stacked
   * modals where the top one should respond first.
   *
   * Letter and number shortcuts are suppressed when the user is typing
   * in an input, textarea or select. Escape and modifier combos always
   * fire regardless.
   *
   * @example
   * ```js
   * static shortcuts = {
   *   'Escape':     'handleClose',
   *   '$mod+Enter': 'handleSubmit',   // Ctrl+Enter on Windows, Cmd+Enter on Mac
   *   '$mod+K':     'handleSearch',   // Ctrl+K on Windows, Cmd+K on Mac
   * }
   * ```
   */
  static shortcuts: Record<string, string> = {}





  // ----------------------------------------
  // Private state
  // ----------------------------------------

  // Stores the cleanup function returned by onMount().
  // Called automatically when the element disconnects from the DOM.
  #cleanup: (() => void) | null = null





  // ----------------------------------------
  // Property shorthand support
  // ----------------------------------------

  /**
   * Converts property shorthand to Lit's expected format.
   *
   * @remarks
   * Allows writing `name: String` instead of `name: { type: String }`.
   * All standard Lit property options (`reflect`, `attribute`, `converter`,
   * `hasChanged`, `state`) still work when passed as a full object.
   *
   * @example
   * ```js
   * static properties = {
   *   name: String,                              // shorthand
   *   week: Number,                              // shorthand
   *   active: { type: Boolean, reflect: true },  // full object still works
   *   _count: { state: true },                   // internal state still works
   * }
   * ```
   */
  static createProperty(name: PropertyKey, options: any) {
    if (
      options === String ||
      options === Number ||
      options === Boolean ||
      options === Array ||
      options === Object
    ) {
      options = { type: options }
    }
    super.createProperty(name, options)
  }





  // ----------------------------------------
  // Bourbon lifecycle
  // ----------------------------------------

  /**
   * Override to run setup when the element mounts.
   *
   * @remarks
   * Runs once when the element connects to the DOM, before the first
   * render. Use for data fetching, timers, external event listeners,
   * or any other setup work.
   *
   * Return a cleanup function and Bourbon calls it automatically when
   * the element disconnects. You never need to write `connectedCallback`
   * or `disconnectedCallback`.
   *
   * For async work like data fetching, return nothing -- Bourbon handles
   * the render automatically when reactive properties update.
   * Do not return a cleanup function from an async onMount.
   *
   * @example Data fetching (no cleanup needed)
   * ```js
   * async onMount() {
   *   this.students = await bourbon.call('getStudents')
   * }
   * ```
   *
   * @example Timer with cleanup
   * ```js
   * onMount() {
   *   const timer = setInterval(() => this.seconds++, 1000)
   *   return () => clearInterval(timer)
   * }
   * ```
   *
   * @example External listener with cleanup
   * ```js
   * onMount() {
   *   const handler = () => this.handleResize()
   *   window.addEventListener('resize', handler)
   *   return () => window.removeEventListener('resize', handler)
   * }
   * ```
   */
  onMount(): (() => void) | void | Promise<void> {
    // override in subclass when needed
  }



  /**
   * Override to compute derived state before every re-render.
   *
   * @remarks
   * Runs before every render when properties have changed. Use for
   * computing values derived from multiple properties that would be
   * expensive to recompute with a getter, or for reading DOM state
   * before a render occurs.
   *
   * For simple derived values, prefer a native JavaScript getter:
   * ```js
   * get fullName() { return `${this.firstName} ${this.lastName}` }
   * ```
   *
   * @param changed - Map of changed properties to their previous values.
   *
   * @example
   * ```js
   * beforeRender(changed) {
   *   if (changed.has('firstName') || changed.has('lastName')) {
   *     this.fullName = `${this.firstName} ${this.lastName}`
   *   }
   * }
   * ```
   */
  beforeRender(changed: PropertyValues): void {
    // override in subclass when needed
  }



  /**
   * Override to run one-time setup after the first render.
   *
   * @remarks
   * Runs once after the element's DOM has been created for the first
   * time. The Shadow DOM is accessible here. Use for DOM queries,
   * focus management, or initializing third-party libraries that
   * need access to the rendered DOM.
   *
   * For element references, prefer `ref` and `createRef` from
   * `@bourbon/core` -- they are more declarative and avoid the need
   * for `onDomReady` in most cases.
   *
   * @example
   * ```js
   * onDomReady() {
   *   this.renderRoot.querySelector('input')?.focus()
   * }
   * ```
   */
  onDomReady(): void {
    // override in subclass when needed
  }



  /**
   * Override to control whether this element should re-render.
   *
   * @remarks
   * Called before every potential re-render. Return `false` to skip
   * the render cycle entirely. Use sparingly -- Lit's rendering is
   * already optimized and only updates changed DOM.
   *
   * @param changed - Map of changed properties to their previous values.
   * @returns Whether the element should update. Defaults to `true`.
   *
   * @example
   * ```js
   * shouldRender(changed) {
   *   // only re-render when the name property changes
   *   return changed.has('name')
   * }
   * ```
   */
  shouldRender(changed: PropertyValues): boolean {
    return true
  }





  // ----------------------------------------
  // Bourbon event helpers
  // ----------------------------------------

  /**
   * Dispatch a custom event to parent components.
   *
   * @remarks
   * Use this to communicate upward -- for example when a button inside
   * a card is clicked and the parent view needs to react. Always sets
   * `bubbles: true` and `composed: true` so the event crosses Shadow
   * DOM boundaries and reaches any ancestor listening for it with
   * `@event-name` in their template.
   *
   * @param eventName - The event name. Use kebab-case by convention.
   * @param detail - Optional data to pass with the event.
   *
   * @example
   * ```js
   * // inside a component
   * handleClick() {
   *   this.dispatch('student-selected', { studentId: this.studentId })
   * }
   *
   * // in a parent template
   * html`<student-card @student-selected="${this.handleStudentSelected}"></student-card>`
   * ```
   */
  dispatch(eventName: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    }))
  }



  /**
   * Manually trigger a re-render.
   *
   * @remarks
   * Only needed when you mutate state that Lit cannot detect reactively
   * -- for example, mutating a property inside an array or object
   * without replacing the reference. In most cases, replacing the
   * reference is cleaner: `this.items = [...this.items, newItem]`.
   *
   * @example
   * ```js
   * this.config.theme = 'dark'  // Lit can't see this mutation
   * this.rerender()             // tell Lit to re-render
   * ```
   */
  rerender(): void {
    this.requestUpdate()
  }



  /**
   * Wait for the current render to complete.
   *
   * @remarks
   * Returns a Promise that resolves when the element has finished
   * updating its DOM. Use when you need to access the updated DOM
   * immediately after setting a reactive property.
   *
   * In most cases, `ref` and `createRef` are cleaner alternatives
   * that avoid the need to await render completion.
   *
   * @example
   * ```js
   * async handleExpand() {
   *   this.expanded = true
   *   await this.rendered()
   *   this.renderRoot.querySelector('input')?.focus()
   * }
   * ```
   */
  async rendered(): Promise<void> {
    await this.updateComplete
  }





  // ----------------------------------------
  // Rare lifecycle escape hatches
  // ----------------------------------------

  /**
   * Override to react when this element moves to a new document.
   *
   * @remarks
   * Fires when `document.adoptNode(element)` is called -- typically
   * when an element moves between an iframe and the main document.
   * Extremely rare in typical Bourbon apps.
   *
   * @param newDocument - The document this element was adopted into.
   */
  movedToDocument(newDocument: Document): void {
    // override in subclass when needed
  }

  /**
   * Override to react when an observed HTML attribute changes.
   *
   * @remarks
   * In Bourbon, `static properties` handles attribute observation
   * automatically for all declared properties. You only need this
   * for custom attribute parsing that `static properties` cannot handle.
   *
   * @param name - The name of the changed attribute.
   * @param oldValue - The previous attribute value.
   * @param newValue - The new attribute value.
   */
  onAttributeChange(name: string, oldValue: string | null, newValue: string | null): void {
    // override in subclass when needed
  }




  
  // ----------------------------------------
  // Internal Lit lifecycle
  // ----------------------------------------
  // These methods are intentionally hidden from Bourbon's public API.
  // Use the Bourbon lifecycle methods above instead.
  //
  // Do not override these in your components -- bourbon check will
  // warn and the dev-mode runtime check will throw if you do.

  connectedCallback() {
    super.connectedCallback()

    // Dev mode: throw immediately if a subclass overrides connectedCallback.
    // The component will not render until the override is removed.
    if (import.meta.env.DEV) {
      const proto = Object.getPrototypeOf(this)
      if (proto.connectedCallback !== BourbonElement.prototype.connectedCallback) {
        throw new Error(
          `[Bourbon] ${this.constructor.name} overrides connectedCallback, ` +
          `which Bourbon uses internally.\n\n` +
          `Move your setup code into onMount() instead:\n\n` +
          `  onMount() {\n` +
          `    // your setup code here\n` +
          `    return () => {\n` +
          `      // optional cleanup\n` +
          `    }\n` +
          `  }\n`
        )
      }
    }

    // 1. Inject shared stylesheets into the render root.
    // Uses renderRoot (not shadowRoot) so this works regardless of
    // whether the shadow root mode is open or closed.
    // Filters already-adopted sheets to prevent duplicates when the
    // element is removed and re-added to the DOM.
    const adopted = (this.constructor as typeof BourbonElement).adopt
    if (adopted.length > 0 && this.renderRoot instanceof ShadowRoot) {
      const current = new Set(this.renderRoot.adoptedStyleSheets)
      const toAdd = adopted.filter(sheet => !current.has(sheet))
      if (toAdd.length > 0) {
        this.renderRoot.adoptedStyleSheets = [
          ...this.renderRoot.adoptedStyleSheets,
          ...toAdd,
        ]
      }
    }

    // 2. Register keyboard shortcuts with the global registry.
    const shortcuts = (this.constructor as typeof BourbonElement).shortcuts
    if (Object.keys(shortcuts).length > 0) {
      registerShortcuts(shortcuts, this)
    }

    // 3. Call onMount() and store the cleanup function if one is returned.
    // Note: do not return a cleanup function from an async onMount --
    // the cleanup would be lost inside the Promise.
    const result = this.onMount()
    if (typeof result === 'function') {
      this.#cleanup = result
    }
  }



  disconnectedCallback() {
    super.disconnectedCallback()

    // Dev mode: throw if a subclass overrides disconnectedCallback.
    if (import.meta.env.DEV) {
      const proto = Object.getPrototypeOf(this)
      if (proto.disconnectedCallback !== BourbonElement.prototype.disconnectedCallback) {
        throw new Error(
          `[Bourbon] ${this.constructor.name} overrides disconnectedCallback, ` +
          `which Bourbon uses internally.\n\n` +
          `Return a cleanup function from onMount() instead:\n\n` +
          `  onMount() {\n` +
          `    // your setup code here\n` +
          `    return () => {\n` +
          `      // your cleanup code here\n` +
          `    }\n` +
          `  }\n`
        )
      }
    }

    // 1. Remove this element's shortcuts from the global registry.
    unregisterShortcuts(this)

    // 2. Call the cleanup function returned by onMount() if any.
    this.#cleanup?.()
    this.#cleanup = null
  }

  willUpdate(changed: PropertyValues) {
    super.willUpdate(changed)
    this.beforeRender(changed)
  }



  protected override update(changed: PropertyValues) {
    // Dev mode: throw if a subclass overrides update().
    // Overriding update() without calling super breaks rendering entirely.
    if (import.meta.env.DEV) {
      const proto = Object.getPrototypeOf(this)
      if (proto.update !== BourbonElement.prototype.update) {
        throw new Error(
          `[Bourbon] ${this.constructor.name} overrides update(), ` +
          `which Bourbon uses internally.\n\n` +
          `Use beforeRender(changed) to compute state before rendering:\n\n` +
          `  beforeRender(changed) {\n` +
          `    // compute derived state here\n` +
          `  }\n`
        )
      }
    }
    super.update(changed)
  }



  firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed)
    this.onDomReady()
  }



  shouldUpdate(changed: PropertyValues): boolean {
    // Call super first to ensure ReactiveControllers are respected,
    // then AND with Bourbon's shouldRender hook.
    return super.shouldUpdate(changed) && this.shouldRender(changed)
  }



  adoptedCallback() {
    this.movedToDocument(this.ownerDocument)
  }


  
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue)
    this.onAttributeChange(name, oldValue, newValue)
  }

}
