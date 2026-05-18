Improve a component or page's UI, accessibility, responsiveness, or PrimeVue/SCSS usage.

Steps:

1. Inspect the current component, related shared components, and existing SCSS tokens.
2. Prefer PrimeVue props/pass-through options and existing design tokens over custom styling.
3. Avoid literal colors in styled properties; use variables or tokens.
4. Preserve `.vue` block order: `script` -> `template` -> `style`.
5. Verify responsive behavior, keyboard/accessibility concerns, and RTL impact.
6. Run `npm run lint`, `npm run type-check`, and targeted tests when behavior changed.
