import { BourbonElement } from './bourbon-element.js'



/**
 * Base class for Bourbon views.
 *
 * @remarks
 * Extends {@link BourbonElement} with Shadow DOM disabled. Use for
 * page-level elements in `public/views/` where global styles need to apply.
 *
 * Views get everything `component` provides -- `onMount()`, `dispatch()`,
 * `static shortcuts`, `static properties` shorthand, and all other Bourbon
 * lifecycle methods -- with one difference: Shadow DOM is off, so styles
 * from `global.css` reach inside the view.
 *
 * Views orchestrate data and compose components -- they are not reusable
 * UI elements. The router renders views into the outlet when the URL
 * changes. Views fetch data via `bourbon.call()` and pass it down to
 * components as properties.
 *
 * Note: `static adopt` is available but not useful on views since global
 * styles already apply. Use it only on {@link component}.
 *
 * @example
 * ```js
 * import { view, html } from '@bourbon/core'
 *
 * class DashboardView extends view {
 *
 *   // ----------------------------------------
 *   // Definition
 *   // ----------------------------------------
 *
 *   static properties = {
 *     students: Array,
 *     loading: Boolean,
 *   }
 *
 *   // ----------------------------------------
 *   // Lifecycle
 *   // ----------------------------------------
 *
 *   async onMount() {
 *     this.loading = true
 *     this.students = await bourbon.call('getStudents')
 *     this.loading = false
 *   }
 *
 *   // ----------------------------------------
 *   // Render
 *   // ----------------------------------------
 *
 *   render() {
 *     if (this.loading) return html`<p>Loading...</p>`
 *     return html`
 *       <div class="page">
 *         ${this.students?.map(s => html`
 *           <student-card
 *             .name="${s.name}"
 *             .studentId="${s.id}"
 *             @student-selected="${this.handleStudentSelected}"
 *           ></student-card>
 *         `)}
 *       </div>
 *     `
 *   }
 *
 *   // ----------------------------------------
 *   // Handlers
 *   // ----------------------------------------
 *
 *   handleStudentSelected(e) {
 *     router.navigate(`/students/${e.detail.studentId}`)
 *   }
 *
 * }
 * ```
 *
 * @see {@link component} for reusable encapsulated elements
 */
export class view extends BourbonElement {

  // Shadow DOM is disabled by returning `this` instead of a shadow root.
  // Global CSS from global.css applies to everything inside a view.
  createRenderRoot() {
    return this
  }

}
