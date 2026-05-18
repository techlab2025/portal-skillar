Wire a backend API endpoint or module into this repository's layered frontend architecture.

Steps:

1. Inspect `docs/Skillar_ai.postman_collection.json` for endpoint group, method, and path.
2. Check `documentation/**` for matching request/response examples when available.
3. Compare against the closest existing `src/modules/**` implementation, using `employee` as the CRUD reference when appropriate.
4. Implement through `core/data/presentation` layers; keep network logic in `data/`.
5. Add or update i18n keys in both English and Arabic for any UI text.
6. Add companion tests for changed `src/**/*.ts|vue` files unless excluded by the coverage hook.
7. Run `npm run type-check` and targeted Vitest tests.
8. Return the API contract used, files changed, and validation evidence.
