Write or improve tests for the requested file, module, or behavior.

Steps:

1. Identify the changed or requested unit and its companion test location.
2. Reuse existing Vitest, Vue Test Utils, and repository mock patterns.
3. Cover meaningful behavior, API mapping, controller orchestration, and regression cases.
4. Mock external dependencies and API calls; do not hit real network endpoints.
5. Ensure staged `src/**/*.ts|vue` files satisfy `scripts/check-test-coverage.mjs`.
6. Run the focused `npx vitest run <test-file>` command and report results.
