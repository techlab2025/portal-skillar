# Release Readiness

Run these checks before opening or merging a PR into `dev`:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `stylelint "src/**/*.{vue,css,scss}"`
4. `node scripts/check-test-coverage.mjs`
5. `npm run type-check`
6. `npm run test:run`
7. `npm run test:coverage`
8. `npm run build`

Notes:

- Use `npm` only.
- Staged `src/**/*.ts` and `src/**/*.vue` files need companion tests unless excluded by `scripts/check-test-coverage.mjs`.
- Keep user-facing text in `src/locales/en.json` and `src/locales/ar.json`.
- Treat lint or build warnings as release risks even when they do not fail the command.
