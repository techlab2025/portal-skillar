Review staged or proposed changes against this repository's architecture and quality gates.

Steps:

1. Inspect the diff and identify affected modules, views, routes, styles, locales, and tests.
2. Check architecture boundaries: `presentation -> repository -> api service`.
3. Verify API work follows documented contracts and keeps network logic in `data/`.
4. Check TypeScript strictness, Vue block order, singleton usage, i18n coverage, style-token usage, and accessibility.
5. Verify companion tests exist for changed `src/**/*.ts|vue` files unless excluded by the coverage hook.
6. Lead with findings ordered by severity, then open questions, then a brief summary.
