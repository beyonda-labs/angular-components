# Roadmap

## Standardisation towards 1.0

Closing a consistent version before adding anything else. The rules themselves live in `rules/`; this list only
tracks what is left to do in this repo.

### S0 - Decisions _(done)_

- [x] Product-specific modules (`page`, `properties-menu`, `pdf-viewer`) stay in the library, declared as a
      `product` layer
- [x] Signals + `OnPush` as the standard, configs immutable
- [x] Flat kebab classes with `is-*` / `has-*` for state
- [x] Bootstrap as the base, fed one-way by `--bey-*` tokens
- [x] 1.0 may break the public API

### S1 - Token foundation _(done)_

- [x] `tokens.css` implementing [tokens.md](./tokens.md): colour, spacing, radius, typography, borders,
      elevation, motion, stacking — 36 font sizes into 7 steps, 20 radii into 7, 20 spacings into 8
- [x] Duplicate grey scale (`--bey-color-dark-*`, `--bey-color-neutral-*`) dropped, along with two shadow
      tokens nothing used; `color-palette.css` replaced by `tokens.css`
- [x] `--text-*` renamed to `--bey-text-*` across 35 files, so nothing unprefixed can collide with a consumer
- [x] `--bs-*` is now one-way: no CSS in the library reads one, and the bridge in `overrides.css` feeds them
      all from tokens
- [x] `check-tokens.js`: a `var(--bey-*)` with no definition and no fallback now fails. It found two shadows
      that have never painted (`--bey-left-menu-shadow`, `--bey-login-shadow-card`), both fixed

Dark mode is now expressible in one place — every semantic token flips under `body.dark` — but 35
`:host-context(body.dark)` blocks across 30 components still carry their own palettes. Removing them means
re-pointing each component's variables at semantic tokens, which is per-module work and belongs in S6.

### S2 - Gates

Strict rules run on the files a commit touches, through husky + lint-staged, so they bite on new and changed
code without blocking work on the 22.905 lines that predate them. `pnpm run verify` runs every gate over the
whole repo: it fails today on purpose, and passing it is what "S6 is finished" means.

- [x] stylelint encoding `rules/angular/styles.md`: `bey-` prefixes, `is-*`/`has-*` states, no `!important`,
      no `--bs-*` read, no literal design value outside the token layer
- [x] Prettier on save, `format` and `format:check` over `{ts,html,css,json}`, plus the one-off pass that
      brought 523 files into line. ESLint's `quotes` rule now allows the double quotes Prettier uses around
      an apostrophe, and `merge-translations` ends its bundles with a newline, so a generated file no
      longer fights the formatter
- [x] husky + lint-staged: eslint + stylelint + prettier on staged files, verified to block a bad commit
- [x] Jest coverage thresholds set just under today's numbers (82.2 / 69.7 / 76.1 / 82.2), so coverage can
      only go up
- [x] `@angular-eslint/prefer-on-push-component-change-detection` and `prefer-standalone`
- [x] `check-translations.js`: duplicate keys across files, maximum depth, kebab-case
- [x] `check-style-guides.js`: every module has a style-guide, is registered, and has a README
- [x] Broken `ng test` target removed from `angular.json` — `pnpm test` is the entry point
- [ ] ESLint flat config (v9) — deferred, see below
- [ ] Tighter `complexity` / `max-len` / `max-lines` — better calibrated after S6

Where a gate cannot be met yet, it warns instead of failing, and flips to an error when its migration lands:

| Gate | Today | Flips to error |
| ---- | ----- | -------------- |
| Literal values outside the token layer | 549 warnings | end of S1 |
| `OnPush` on every component | 85 warnings | end of S6 |
| Kebab-case translation keys | 232 warnings | end of S6 |
| stylelint errors (naming, `!important`, `--bs-*`) | 190 errors, staged files only | end of S6 |
| `check-style-guides` | 6 modules failing | end of S6 |

Migrating to ESLint flat config is deferred on purpose: it is a rewrite of a 300-line config, it adds no
guarantee the current setup does not already give, and getting it wrong silently drops rules. It belongs after
the migration, not in the middle of it.

### S3 - Package hygiene

- [x] `sideEffects` limited to the CSS files — the library has no module-level side effects, so consumers can
      now tree-shake what they do not import
- [x] Everything public carries the `Bey` prefix: `BeyFooterConfig`, `BeyFooterConfigParameters`,
      `BEY_ENVIRONMENT_CONFIG`, `BeyEnvironmentConfig` (285 exports, 4 renamed, none lost)
- [x] Root `public-api.ts` grouped by layer (primitives / composites / product / services / demo)
- [x] `angular.json` prefix aligned with ESLint (`by` → `bey`)
- [x] Style-guide demo text out of the product's translation bundle: `merge-translations` now writes two
      bundles. The library one drops from 45 KB to 17.5 KB, and the product's own bundle from 52 KB to 35.6 KB
- [x] `sass` devDependency dropped — no `.scss` is left in the workspace, and `@angular-devkit/build-angular`
      carries its own copy
- [ ] The style-guide's code and declarations still ship — see below

The style-guide translations are split and the demo route is lazy, but the JavaScript is not separated: it is
14% of the library bundle (206 KB of 1.43 MB in a development build), and 21 `.d.ts` files (14.8 KB). Since
`document-builder-front` imports `BeyStyleGuideComponent`, the bundler keeps it in the shared chunk that
`main` loads eagerly, so every user of the product downloads it. Dropping the export removes all of it at
once; the options are a secondary entry point, or moving the demo page to `angular-components-demo`.

### S4 - Style-guide infrastructure _(done)_

- [x] `bey-style-guide-section` (title + card) replaces the 19 hand-written repetitions in the global
      style-guide. First component written to the new rules: signals, `OnPush`, tokens only
- [x] Shared utilities moved out of `style-guide.component.css` into `style-guide-shared.css`, reading from
      tokens. A module style-guide no longer imports another module's component stylesheet, which the rules
      forbid
- [x] `bey-sg-*` renamed to `bey-style-guide-*`, so the shared classes read like everything else

Eight modules used those shared classes without importing the stylesheet, so the styles never applied to them:
`floating-preferences`, `footer`, `form`, `list`, `login`, `pagination`, `table` and `tree`. All wired up now.

### S5 - Pilot module _(done: tabs)_

- [x] `tabs` migrated end to end: tokens, class naming, signals, tests, i18n, exports, README, and its own
      style-guide. It passes every gate with zero findings
- [ ] Decide on `@testing-library/angular` — not needed for `tabs`: four local helpers covered it. Worth
      revisiting on a module with heavier interaction

What the pilot cost, and what it changed beyond the plan:

- **The config was mutable.** `TabsConfig.setActiveTab` wrote into the config the component received, exactly
  what the rules forbid. The component now owns the active tab and reports through `onTabChange`; the config
  carries the initial value only. Nothing outside the module called it, so the break is cheap here — other
  modules may not be so lucky.
- **`linkedSignal` is the tool for input-derived writable state.** It resets when the config instance is
  replaced, which is precisely the old setter's behaviour.
- **`unicorn/consistent-function-scoping` had to go.** It flags every `computed()` and `linkedSignal()` class
  field as hoistable, so it is incompatible with the standard we adopted.
- **stylelint needed keyword allowances** (`solid`, `ease`, …) before a properly migrated file could come out
  clean: `border: var(--x) solid var(--y)` was being reported as a literal.
- **A style-guide has to migrate with its module.** Under `OnPush`, plain fields written from a callback never
  repaint, so its demo state has to become signals too.
- **Tests: 23 to 15**, covering the same behaviour through the rendered output instead of internal state.
- **README: 145 lines to 75**, with the overflow strategy moved out of a code comment into it.

Rough cost per module, from this one: a primitive like `breadcrumb` or `pagination` is smaller; `form`,
`table`, `page` and `properties-menu` are several times larger and will each surface their own version of the
mutable-config question.

### S6 - Migration

A scan for the pattern the pilot uncovered says the API breaks are contained: only `pagination`
(`setPage`, `setPageSize`, `setTotalItems`) and `form` (`setInitialValue`) have a model that writes into
itself. What looked like the same thing in `properties-menu`, `table` and `tree` is a service's own signal,
a callback field and dialog callbacks.


- [ ] The remaining 21 modules, one at a time
- [ ] `badge` becomes a real component instead of global CSS classes
- [ ] Style-guides for `search` and `page`; READMEs for `badge`, `loading`, `login`, `page`
- [ ] Translation keys to kebab-case (45 in the library, 171 in the style-guides)
- [ ] Trim module READMEs to the agreed shape
- [ ] Translate what is still in Spanish into English: the `footer` and `floating-preferences` READMEs,
      six `describe()` names across `form` and `properties-menu`, and the demo labels of the
      `properties-menu` style-guide
- [ ] Remove the 35 `:host-context(body.dark)` blocks that only restate the palette, one module at a time

### S7 - Release

- [ ] Tag 1.0.0 (the repo has no tags at all today)
- [ ] Add `lint` to the published path: Jenkins runs `build`, which runs the tests but never the linter

Publishing already runs on Jenkins, configured on the server — there is no `Jenkinsfile` in the repo by design.
Snapshots per branch, `latest` from `main`, as described in the README.

---

## Features

### Form

- [x] Field types: `select`, `checkbox`, `radio`, `textarea`, `date`, `text`, `number`
- [x] Advanced validators (`email`, `url`, `custom sync`, `async`)
- [x] Accessibility (`aria-required`, `aria-invalid`, `aria-label`) across all fields

### Core UI

- [ ] Layout: `card`, `panel`
- [x] Feedback: `toast`, `loading spinner` (inline + overlay + service)
- [ ] Feedback: `alert`, `progress bar`
- [x] Modals (info, warning, error, confirmation via service)
- [ ] Drawers

### Data and navigation

- [x] Table / grid (configurable columns, sorting, row selection)
- [ ] Table / grid: filters
- [x] Pagination
- [x] Tabs
- [x] Breadcrumb
- [x] Sidebar (`left-menu` with grouped actions, sub-actions and collapse)
- [x] Header (configurable left / right actions)

### Rich interactions

- [ ] Text editor
- [ ] Drag & drop and reorderable lists
- [ ] File board / manager

### Delivery

- [x] Demo component (`style-guide` with simple / composite sections)
- ~~Storybook~~ — decided against. It would solve the packaging boundary for free and give visual
  regression, but its main draw, controls generated from the component inputs, does not work with a
  single `config` object input, so it changes the tool without changing the guarantee. Revisit only if
  automated visual diffing becomes something we would actually run.
- [ ] API docs (TypeDoc)

### Outside the original roadmap

- [x] `app-layout` (full layout with integrated left-menu, breadcrumb and footer)
- [x] `login` (authentication with light/dark theme and optional OAuth providers)
- [x] `footer`
- [x] `floating-preferences` (theme and language selector)
