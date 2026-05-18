# Sprint 1 — Vue Frontend Senior Review & Action Plan

**Date:** 2026-05-18
**Scope:** Full-codebase audit (no staged diff)
**Status:** Plan approved, awaiting execution

---

## Executive Summary

No staged or unstaged diff exists; this is a full-codebase audit.

The app has a recognizable layered shape and many modules follow `presentation -> controller -> repository -> api service`, with API calls generally kept out of Vue components. However, it is not production-ready for team handoff. The biggest risks are broken lint gates, incomplete i18n, copy-paste modules that do not match their backend contracts, companion-test hook failures for many files, and style-token violations.

**Verified checks:**

| Check                                     | Result                          |
| ----------------------------------------- | ------------------------------- |
| `npm run type-check`                      | Passed                          |
| `npx tsc --noEmit`                        | Passed                          |
| `npm run test:run`                        | Passed — 232 files, 1117 tests  |
| `npx eslint . --ext .ts,.vue`             | Failed — 2 errors, 866 warnings |
| `npx stylelint "src/**/*.{vue,css,scss}"` | 34 warnings                     |

**Assumptions:**

- `Questions` module is under development — skip for now.
- Route/menu/breadcrumb translation will go through route `meta` keys.
- Active production API is `https://api.skillarai.com/skillar/`.

---

## Scores

| Area                 | Score |
| -------------------- | ----: |
| Architecture         |     6 |
| Code Quality         |     5 |
| TypeScript           |     5 |
| API Layer            |     6 |
| State Management     |     5 |
| i18n                 |     3 |
| Styling              |     5 |
| Performance          |     6 |
| Testing              |     6 |
| Production Readiness |     5 |

---

## Critical Issues

| Priority | Problem                                                                                                                        | Why It Matters                                                      | File/Path Example                                                                                                                                     | Recommended Fix                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| High     | ESLint fails on unused variables in tests.                                                                                     | Pre-commit fails when affected files are staged.                    | `src/shared/HelpersComponents/__tests__/RadioSection.test.ts:60`, `src/shared/Language/__tests__/LangInput.test.ts:43`                                | Remove unused variables or rename to `_radio` / `_options`.                    |
| High     | i18n coverage is incomplete. `en.json` has 263 keys, `ar.json` has 99; 164 English keys are missing Arabic translations.       | Arabic locale falls back to English or displays raw keys.           | `src/locales/en.json`, `src/locales/ar.json`, hardcoded text in `EmployeeIndex.vue:142`, `DataStatusBuilder.vue:177`                                  | Add missing Arabic keys and replace hardcoded strings with `$t()`.             |
| High     | Companion-test coverage hook would fail for many staged files. Full scan found 243 non-excluded files without companion tests. | Future edits in these files will block commits.                     | `scripts/check-test-coverage.mjs:47`, `Questions/presentation/components/questionsIndex.vue` has `EmployeeIndex.test.ts` not `questionsIndex.test.ts` | Rename misplaced tests or add proper companion tests.                          |
| High     | Route/menu/breadcrumb labels are hardcoded English, not translated.                                                            | Sidebar, breadcrumb, and route names remain English in Arabic mode. | `SidebarNavigation.vue:40`, `RouteHelper.ts:19`, `router/routes/modules/*.ts`                                                                         | Store translation keys in route `meta` and menu config; render through `$t()`. |
| High     | Production API config points to stale Orbit URL instead of Skillar.                                                            | API calls in production environment hit wrong server.               | `src/base/Core/Config/environment.config.ts:37`, `src/base/Core/NetworkStructure/baseUrl.ts:4`                                                        | Update production `apiBaseUrl` to `https://api.skillarai.com/skillar/`.        |

---

## Architecture Violations

| Priority | Problem                                             | File/Path Example                                                                       | Recommended Fix                                                             |
| -------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| High     | Route/menu metadata is hardcoded and not localized. | `SidebarNavigation.vue:40`, `RouteHelper.ts:19`, `router/routes/modules/question.ts:10` | Store translation keys in route meta/menu config and render through `$t()`. |
| Medium   | Components contain export/business logic directly.  | `EmployeeIndex.vue:93`, `SkillsIndex.vue:87`, `questionsIndex.vue:93`                   | Move export logic into shared export utility or reuse `ExportExcel.vue`.    |
| Medium   | Draft form store has employee-specific assumptions. | `stores/formsStore.ts:35`, `stores/formsStore.ts:59`                                    | Make draft detection field-agnostic; move toast strings to i18n.            |
| Low      | No direct network calls inside Vue components.      | Verified across all modules                                                             | Preserve this pattern.                                                      |

---

## i18n Issues

| Priority | Problem                                                            | File/Path Example                                                        | Recommended Fix                                              |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| High     | `ar.json` missing 164 keys that exist in `en.json`.                | `src/locales/en.json`, `src/locales/ar.json`                             | Add all missing Arabic translations.                         |
| High     | Many user-facing strings bypass `$t()`.                            | `UnitForm.vue:161`, `EmployeeIndex.vue:222`, `DataStatusBuilder.vue:230` | Replace with locale keys.                                    |
| High     | Some `$t()` calls use raw English sentence keys missing in Arabic. | `TopicsDialog.vue:145`, `PrivacyForm.vue:75`                             | Use stable snake_case keys; add EN/AR values.                |
| Medium   | Sidebar/menu groups not localized.                                 | `SidebarNavigation.vue:40`, `SidebarNavigation.vue:91`                   | Convert menu `group` and `name` to i18n keys.                |
| Medium   | RTL behavior not set at layout level.                              | `main.ts:14`                                                             | Add locale watcher that sets `document.documentElement.dir`. |

---

## TypeScript Issues

| Priority | Problem                                           | File/Path Example                                                 | Recommended Fix                                                 |
| -------- | ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| High     | ESLint blocks on unused variables in tests.       | `RadioSection.test.ts:60`, `LangInput.test.ts:43`                 | Remove or underscore intentionally unused locals.               |
| Medium   | `any` is widespread in production code.           | `baseApiService.ts:45`, `RouteHelper.ts:8`, `user.model.ts:21`    | Replace broad `any` with `unknown` plus typed DTO parsing.      |
| Medium   | API response models parse untyped JSON.           | `unit.model.ts:31`, `privacy.model.ts:18`, `document.model.ts:39` | Add module DTO interfaces and `fromJson(json: unknown)` guards. |
| Medium   | Route helper uses `any` for router/route objects. | `RouteHelper.ts:8`, `RouteHelper.ts:36`                           | Type with `RouteLocationNormalizedLoaded` and `Router`.         |
| Low      | Some import type warnings remain.                 | `country.controller.ts:7`, `privacy.controller.ts:5`              | Convert type-only imports to `import type`.                     |

---

## Styling Issues

| Priority | Problem                                                           | File/Path Example                                                    | Recommended Fix                                                              |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Medium   | 34 stylelint token warnings for literal colors.                   | `_sidebar.scss:151`, `_privacy_index.scss:19`, `_terms_form.scss:44` | Replace literals with CSS variables or semantic tokens in `_variables.scss`. |
| Medium   | Duplicated visual patterns across privacy and terms styles.       | `_privacy_form.scss`, `_terms_form.scss`                             | Extract shared policy/terms form styles into shared SCSS partial.            |
| Medium   | Accessibility: clickable breadcrumb uses `span`, not button/link. | `BreadCrumb.vue:29`                                                  | Render `RouterLink` or button with keyboard handling.                        |
| Low      | Generic `alt="image"` in user-facing lists.                       | `EmployeeIndex.vue:176`, `SidebarNavigation.vue:211`                 | Use meaningful alt text or empty alt for decorative images.                  |

---

## Testing / Git Hook Risks

| Check                         | Result                                                 | Risk                                      |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `npm run type-check`          | Passed                                                 | Pre-push OK                               |
| `npx tsc --noEmit`            | Passed                                                 | Pre-commit OK                             |
| `npm run test:run`            | Passed                                                 | Pre-push OK                               |
| `npx eslint . --ext .ts,.vue` | **Failed**                                             | 2 blocking errors                         |
| `npx stylelint`               | Warnings only                                          | Not blocking, but noisy                   |
| Companion coverage script     | Clean with no staged files, but 243 missing companions | Future edits will fail pre-commit         |
| `npm run lint`                | Includes `--fix`                                       | Mutates files; not ideal as CI diagnostic |

---

## Performance and Bundle Risks

| Priority | Problem                                                             | File/Path Example                                                     | Recommended Fix                                                                      |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Medium   | Heavy export libraries statically imported inside route chunks.     | `EmployeeIndex.vue:15`, `SkillsIndex.vue:11`, `questionsIndex.vue:15` | Dynamically import `xlsx` and `file-saver` inside export click handlers.             |
| Medium   | `jspdf`, `html2canvas`, `xlsx`, `cropperjs` are large dependencies. | `package.json:39-50`                                                  | Keep out of initial route chunks; verify bundle with `vite build --mode production`. |
| Low      | `src/main.ts` imports generated `main.min.css`.                     | `main.ts:1`                                                           | Confirm SCSS changes are compiled or switch to source entry.                         |

---

## Production Readiness

| Priority | Problem                                             | File/Path Example                          | Recommended Fix                                                          |
| -------- | --------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| High     | Production API config points to stale Orbit URL.    | `environment.config.ts:37`, `baseUrl.ts:4` | Update to `https://api.skillarai.com/skillar/`.                          |
| High     | i18n not production-ready for Arabic.               | `ar.json`                                  | Complete translations and set document direction.                        |
| Medium   | `EnvironmentManager.isTest` logs via `console.log`. | `environment.manager.ts:139`               | Remove debug log.                                                        |
| Medium   | Logout clears all local storage.                    | `stores/user.ts:30`                        | Clear only auth-related persisted keys unless full reset is intentional. |

---

## Refactor Roadmap

### Phase 1 — Stabilize

- Fix `src/shared/HelpersComponents/__tests__/RadioSection.test.ts:60`
- Fix `src/shared/Language/__tests__/LangInput.test.ts:43`
- Remove `console.log` in `src/base/Core/Config/environment.manager.ts:139`
- Update production `apiBaseUrl` to `https://api.skillarai.com/skillar/`
- Run `npx eslint . --ext .ts,.vue`, `npx tsc --noEmit`, `npm run type-check`, `npm run test:run`

### Phase 2 — Architecture Cleanup

- Implement route/menu/breadcrumb translation via `meta` keys
- Update `RouteHelper.ts` to resolve translation keys or translated labels
- Update `BreadCrumb.vue` to render `$t()` labels
- Update `SidebarNavigation.vue` menu config to use `labelKey` / `groupKey`
- Move export logic out of `EmployeeIndex.vue`, `SkillsIndex.vue`, `questionsIndex.vue`
- Type `RouteHelper.ts` and remove broad `any`
- (Skip `Questions` module — under development)

### Phase 3 — i18n + Styling

- Fill 164 missing Arabic keys in `ar.json`
- Replace hardcoded text in shared status, sidebar, routes, employee, skills, privacy, terms
- Add RTL/LTR document direction handling in `main.ts` or app-level watcher
- Replace stylelint literal-color warnings with semantic tokens
- Start with `_sidebar.scss`, `_privacy_*`, `_terms_*`, skeleton files
- Extract shared privacy/terms SCSS partial

### Phase 4 — Performance

- Dynamic import export/PDF/image-heavy libraries
- Verify route chunk sizes after production build
- Keep PrimeVue and heavy dialogs lazy-loaded

### Phase 5 — Testing + Release Readiness

- Add/rename companion tests for files likely to be edited
- Add i18n key coverage test comparing `en.json` and `ar.json`
- Add release gate docs for `npm run type-check`, `npm run test:run`, eslint, stylelint
- (Defer `Questions` module contract tests until that module is active)

---

## First 10 Tasks

1. Fix unused variables in `RadioSection.test.ts` and `LangInput.test.ts`
2. Remove `console.log` from `environment.manager.ts:139`
3. Update production `apiBaseUrl` to `https://api.skillarai.com/skillar/` in `environment.config.ts`
4. Verify whether `baseUrl.ts` is still used; mark for cleanup if unused
5. Add route `meta.breadcrumbKey` translation keys to all route modules
6. Update `RouteHelper.ts` to return translation keys; type with Vue Router types
7. Update `BreadCrumb.vue` to render `$t()` labels from resolved keys
8. Update `SidebarNavigation.vue` menu config to use `labelKey` / `groupKey` with `$t()`
9. Add EN/AR route/menu locale keys to `en.json` and `ar.json`
10. Replace literal colors in `_sidebar.scss`, `_privacy_*`, `_terms_*` reported by stylelint
