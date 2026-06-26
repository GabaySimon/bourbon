import { BourbonElement } from './bourbon-element.js'



/**
 * Base class for Bourbon components.
 *
 * @remarks
 * Extends {@link BourbonElement} with Shadow DOM enabled. Use for all
 * reusable UI elements in `public/components/`. Styles are fully
 * encapsulated -- nothing from `global.css` leaks in or out. CSS custom
 * properties from `tokens.css` still work everywhere because CSS variables
 * pierce Shadow DOM by design.
 *
 * Bourbon adds the following on top of LitElement:
 *
 * - `static adopt` -- shared stylesheets from `public/styles/shared/`.
 *   Import them at the top of your file and list them here. The browser
 *   parses each stylesheet once and shares the same object across every
 *   component that adopts it -- more efficient than duplicating the same
 *   CSS across multiple `static styles` blocks.
 *
 * - `static shortcuts` -- declarative keyboard shortcuts. Bourbon registers
 *   one global listener for the entire app and routes key events to the
 *   right component automatically. Use `$mod` for cross-platform shortcuts.
 *
 * - `onMount()` -- runs when the component connects to the DOM, before the
 *   first render. Return a cleanup function and Bourbon calls it
 *   automatically when the component disconnects. Replaces
 *   `connectedCallback` and `disconnectedCallback` entirely.
 *
 * - `onDomReady()` -- runs once after the first render. The Shadow DOM is
 *   accessible here. Use for focus management or initializing third-party
 *   libraries that need access to the rendered DOM.
 *
 * - `beforeRender(changed)` -- runs before every re-render. Use for
 *   computing derived state from multiple properties. For simple derived
 *   values, prefer a native JavaScript getter instead.
 *
 * - `shouldRender(changed)` -- controls whether a re-render should happen.
 *   Return `false` to skip the render cycle. Use sparingly.
 *
 * - `dispatch(eventName, detail)` -- dispatches a custom event to parent
 *   components. Use this to communicate upward. Always sets `bubbles: true`
 *   and `composed: true` so the event crosses Shadow DOM boundaries.
 *
 * - `rerender()` -- manually triggers a re-render. Only needed when
 *   mutating state that Lit cannot detect reactively.
 *
 * - `await this.rendered()` -- waits for the current render to complete.
 *   Use when you need to access updated DOM after setting a property.
 *
 * Property shorthand is supported -- use `String`, `Number`, `Boolean`,
 * `Array`, or `Object` directly instead of `{ type: X }`.
 *
 * @example Basic component
 * ```js
 * import { component, html, css } from '@bourbon/core'
 *
 * class StudentCard extends component {
 *
 *   // ----------------------------------------
 *   // Definition
 *   // ----------------------------------------
 *
 *   static properties = {
 *     name: String,
 *     studentId: String,
 *     week: Number,
 *     totalWeeks: Number,
 *   }
 *
 *   static styles = css`
 *     .card { padding: var(--space-4) }
 *     .name { font-weight: bold }
 *   `
 *
 *   // ----------------------------------------
 *   // Render
 *   // ----------------------------------------
 *
 *   render() {
 *     const progress = Math.round((this.week / this.totalWeeks) * 100)
 *     return html`
 *       <div class="card" @click="${this.handleClick}">
 *         <span class="name">${this.name}</span>
 *         <div class="progress" style="width: ${progress}%"></div>
 *       </div>
 *     `
 *   }
 *
 *   // ----------------------------------------
 *   // Handlers
 *   // ----------------------------------------
 *
 *   handleClick() {
 *     this.dispatch('student-selected', { studentId: this.studentId })
 *   }
 *
 * }
 * ```
 *
 * @example With keyboard shortcuts
 * ```js
 * class Modal extends component {
 *
 *   static shortcuts = {
 *     'Escape':     'handleClose',
 *     '$mod+Enter': 'handleSubmit',
 *   }
 *
 *   render() {
 *     return html`
 *       <div class="modal">
 *         <slot></slot>
 *       </div>
 *     `
 *   }
 *
 *   handleClose() { this.dispatch('modal-close') }
 *   handleSubmit() { this.dispatch('modal-submit') }
 *
 * }
 * ```
 *
 * @example With onMount for timers or external listeners
 * ```js
 * class LiveTimer extends component {
 *
 *   static properties = { seconds: Number }
 *
 *   onMount() {
 *     const timer = setInterval(() => this.seconds++, 1000)
 *     return () => clearInterval(timer)
 *   }
 *
 *   render() {
 *     return html`<span>${this.seconds}s</span>`
 *   }
 *
 * }
 * ```
 *
 * @example With shared styles
 * ```js
 * import cardStyles from '../styles/shared/cards.css'
 *
 * class StudentCard extends component {
 *   static adopt = [cardStyles]
 *   static styles = css`.name { font-weight: bold }`
 * }
 * ```
 *
 * @see {@link view} for page-level elements where global styles apply
 */
export class component extends BourbonElement {}
