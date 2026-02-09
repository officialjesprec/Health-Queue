---
name: Web Development Mastery
description: A comprehensive guide to modern web development skills, best practices, and learning paths, inspired by the andreasbm/web-skills project.
---

# Web Development Mastery Skill

This skill serves as a training manual and reference guide for mastering modern web development. It covers the essential pillars of building robust, accessible, and performant web applications.

## 1. Fundamentals

### HTML5 (The Structure)
- **Semantic HTML**: Use `<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`, `<header>`, `<footer>` instead of generic `<div>`s where possible. This improves SEO and Accessibility.
- **Microdata**: Use Schema.org microdata for better search engine understanding.
- **Forms**: Leverage built-in validation (`required`, `pattern`, `min`, `max`) and correct input types (`email`, `tel`, `url`).

### CSS3 (The Presentation)
- **Layout Models**:
  - **Flexbox**: One-dimensional layout (rows/columns). Use for alignment and distribution.
  - **Grid**: Two-dimensional layout. Use for overall page structure.
- **Responsive Design**: Mobile-first approach using `@media (min-width: ...)` queries.
- **Custom Properties**: Use CSS variables (`--primary-color`) for theming.
- **Transitions & Animations**: Use `transform` and `opacity` for high-performance animations (avoids layout thrashing).

### JavaScript (The Behavior)
- **ES6+ Features**:
  - Destructuring: `const { data } = response;`
  - Arrow Functions: Concise syntax and lexical `this`.
  - Modules: `import` / `export` for code organization.
  - Async/Await: Cleaner handling of asynchronous operations.
- **DOM Manipulation**: Understanding the Virtual DOM provided by frameworks like React.

## 2. Accessibility (A11y)

Building for everyone is not optional.
- **Keyboard Navigation**: Ensure all interactive elements are reachable via Tab.
- **Focus Management**: Verify focus states are visible (`:focus-visible`).
- **Screen Readers**:
  - Use `alt` text for images.
  - Use `aria-label` for icon-only buttons.
  - Ensure heading hierarchy (`h1` -> `h2` -> `h3`) is logical.
- **Contrast**: Maintain a minimal contrast ratio of 4.5:1 for text.

## 3. Web Components & Modern Frameworks

Understanding the underlying component model.
- **Component Architecture**: Breaking UIs into small, reusable, isolated pieces.
- **Props & State**: Data flow (unidirectional in React).
- **Hooks**: standardized way to handle side effects (`useEffect`) and state (`useState`).
- **Virtual DOM**: How frameworks optimize rendering updates.

## 4. Performance Optimization (Web Vitals)

- **LCP (Largest Contentful Paint)**: Optimize loading of the main hero element/image.
- **FID (First Input Delay)**: Minimize JavaScript execution time on load.
- **CLS (Cumulative Layout Shift)**: Reserve space for images/embeds.
- **Techniques**:
  - **Lazy Loading**: `loading="lazy"` for images below the fold.
  - **Code Splitting**: Dynamic imports for routes (`React.lazy`).
  - **Asset Optimization**: Use WebP/AVIF formats and minify CSS/JS.

## 5. Progressive Web Apps (PWA)

Making web apps feel native.
- **Manifest**: `manifest.json` for installability.
- **Service Workers**: For offline capabilities and caching strategies (Stale-while-revalidate).
- **Storage**: IndexedDB for complex local data; LocalStorage for simple preferences.

## 6. Testing & Quality Assurance

- **Unit Testing**: Testing individual functions/components (Vitest/Jest).
- **Integration Testing**: Testing how components work together.
- **E2E Testing**: Testing full user flows (Playwright/Cypress).
- **Linting**: ESLint for code quality, Prettier for formatting.

## 7. Security Best Practices

- **XSS (Cross-Site Scripting)**: Sanitize user input; use Content Security Policy (CSP).
- **CSRF**: Use anti-CSRF tokens.
- **HTTPS**: Mandatory for Service Workers and modern APIs.
- **Data Protection**: Never store sensitive data (passwords, tokens) in LocalStorage if avoidable; use HttpOnly cookies.

## 8. Continuous Integration/Deployment (CI/CD)

- **Version Control**: Git best practices (conventional commits).
- **Automated Builds**: Running tests and linters on every push.
- **Deployment**: Automatic deployment to Vercel/Netlify/AWS on merge to main.

## Practical Application for Health Queue Project

Based on these principles, here is how we apply this to the current project:

1.  **Strict Semantics**: Ensure `PatientDashboard` and `StaffDashboard` use distinct semantic sections.
2.  **Optimized Auth**: We use Supabase Auth which handles security (JWTs) correctly.
3.  **Component Reusability**: Extract common UI elements (Buttons, Cards) to `src/components/ui`.
4.  **Type Safety**: Continue using TypeScript strictly to prevent runtime errors.
5.  **Performance**: We've already implemented `React.lazy` for route splitting in `App.tsx`.

---
*Based on the 'Web Skills' roadmap by Andreas Mehlsen.*
