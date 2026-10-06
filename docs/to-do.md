# Roadmap

## Standardisation, shipped as 1.2.0

Closing a consistent version before adding anything else. The rules themselves live in `rules/`; this list only
tracks what is left to do in this repo.

### S0 - Decisions _(done)_

-   [x] Product-specific modules (`page`, `properties-menu`, `pdf-viewer`) stay in the library, declared as a
        `product` layer
-   [x] Signals + `OnPush` as the standard, configs immutable
-   [x] Flat kebab classes with `is-*` / `has-*` for state
-   [x] Bootstrap as the base, fed one-way by `--bey-*` tokens
-   [x] 1.0 may break the public API

### S1 - Token foundation _(done)_

-   [x] `tokens.css` implementing [tokens.md](./tokens.md): colour, spacing, radius, typography, borders,
        elevation, motion, stacking — 36 font sizes into 7 steps, 20 radii into 7, 20 spacings into 8
-   [x] Duplicate grey scale (`--bey-color-dark-*`, `--bey-color-neutral-*`) dropped, along with two shadow
        tokens nothing used; `color-palette.css` replaced by `tokens.css`
-   [x] `--text-*` renamed to `--bey-text-*` across 35 files, so nothing unprefixed can collide with a consumer
-   [x] `--bs-*` is now one-way: no CSS in the library reads one, and the bridge in `overrides.css` feeds them
        all from tokens
-   [x] `check-tokens.js`: a `var(--bey-*)` with no definition and no fallback now fails. It found two shadows
        that have never painted (`--bey-left-menu-shadow`, `--bey-login-shadow-card`), both fixed

Dark mode is now expressible in one place — every semantic token flips under `body.dark` — but 35
`:host-context(body.dark)` blocks across 30 components still carry their own palettes. Removing them means
re-pointing each component's variables at semantic tokens, which is per-module work and belongs in S6.

### S2 - Gates _(done)_

Strict rules run on the files a commit touches, through husky + lint-staged, and `pnpm run verify` runs every
gate over the whole repo. It passes with zero findings and no baseline since the end of S6.

-   [x] stylelint encoding `rules/angular/styles.md`: `bey-` prefixes, `is-*`/`has-*` states, no `!important`,
        no `--bs-*` read, no literal design value outside the token layer
-   [x] `typecheck` in `lint`: jest transpiles each spec in isolation and never checks types, so 35 type errors had
        built up in the specs unseen; `tsc -p tsconfig.spec.json --noEmit` now fails the Lint stage instead
-   [x] `prettier-plugin-organize-attributes`: template attributes grouped (structural, `#ref`, `id`, `class`, static,
        inputs, two-way, outputs) and alphabetical within each group; 58 templates reordered
-   [x] `stylelint-order`: custom properties first, then declarations in alphabetical order (shorthand before its
        longhands); 565 declarations moved by `stylelint --fix`, none across a shorthand boundary
-   [x] Prettier on save, `format` and `format:check` over `{ts,html,css,json}`, plus the one-off pass that
        brought 523 files into line. ESLint's `quotes` rule now allows the double quotes Prettier uses around
        an apostrophe, and `merge-translations` ends its bundles with a newline, so a generated file no
        longer fights the formatter
-   [x] husky + lint-staged: eslint + stylelint + prettier on staged files, verified to block a bad commit
-   [x] Jest coverage thresholds set just under today's numbers (82.2 / 69.7 / 76.1 / 82.2), so coverage can
        only go up
-   [x] `@angular-eslint/prefer-on-push-component-change-detection` and `prefer-standalone`
-   [x] `check-translations.js`: duplicate keys across files, maximum depth, kebab-case
-   [x] `check-style-guides.js`: every module has a style-guide, is registered, and has a README
-   [x] Broken `ng test` target removed from `angular.json` — `pnpm test` is the entry point
-   [x] ESLint 9 with a flat `eslint.config.js`: the same 228 rules as before, checked by diffing `--print-config`
        before and after; the formatting rules moved to `@stylistic/js`, as ESLint deprecates its own
-   [x] `complexity` 28 → 15, `max-lines` 500 → 400 lines of code (600 in a spec), `max-len` 300 → 120, the
        prettier width. Calibrated on the migrated code: one method and two style-guide files had to be split

While the migration ran, every gate warned instead of failing and flipped to an error once its migration
landed: literal values outside the token layer (549 warnings at the start), `OnPush` (85), kebab-case
translation keys (232), stylelint (190 errors) and `check-style-guides` (6 modules). All of them are errors now.

The flat config landed after the migration, once the rules it enforces were met everywhere: rewriting it earlier
would have risked dropping rules silently, so the effective rule set was diffed before and after.

### S3 - Package hygiene _(done)_

-   [x] `sideEffects` limited to the CSS files — the library has no module-level side effects, so consumers can
        now tree-shake what they do not import
-   [x] Everything public carries the `Bey` prefix: `BeyFooterConfig`, `BeyFooterConfigParameters`,
        `BEY_ENVIRONMENT_CONFIG`, `BeyEnvironmentConfig` (285 exports, 4 renamed, none lost)
-   [x] Root `public-api.ts` grouped by layer (primitives / composites / product / services / demo)
-   [x] `angular.json` prefix aligned with ESLint (`by` → `bey`)
-   [x] Style-guide demo text out of the product's translation bundle: `merge-translations` now writes two
        bundles. The library one drops from 45 KB to 17.5 KB, and the product's own bundle from 52 KB to 35.6 KB
-   [x] `sass` devDependency dropped — no `.scss` is left in the workspace, and `@angular-devkit/build-angular`
        carries its own copy
-   [x] The style-guide is a secondary entry point, `@beyonda-labs/angular-components/style-guide`, with its
        sources under `style-guide/src/<module>/`; the primary bundle no longer carries it (907 KB, from 1.1 MB)

Before the entry point, the demo was 14% of the library bundle (206 KB of 1.43 MB in a development build) and
every user of a product that imported `BeyStyleGuideComponent` downloaded it, because the bundler kept it in the
shared chunk that `main` loads eagerly.

### S4 - Style-guide infrastructure _(done)_

-   [x] `bey-style-guide-section` (title + card) replaces the 19 hand-written repetitions in the global
        style-guide. First component written to the new rules: signals, `OnPush`, tokens only
-   [x] Shared utilities moved out of `style-guide.component.css` into `style-guide-shared.css`, reading from
        tokens. A module style-guide no longer imports another module's component stylesheet, which the rules
        forbid
-   [x] `bey-sg-*` renamed to `bey-style-guide-*`, so the shared classes read like everything else

Eight modules used those shared classes without importing the stylesheet, so the styles never applied to them:
`floating-preferences`, `footer`, `form`, `list`, `login`, `pagination`, `table` and `tree`. All wired up now.

### S5 - Pilot module _(done: tabs)_

-   [x] `tabs` migrated end to end: tokens, class naming, signals, tests, i18n, exports, README, and its own
        style-guide. It passes every gate with zero findings
-   [x] `@testing-library/angular`: not adopted. The test rules already ask for what it enforces (queries by role
        and text, behaviour over markup) and every suite follows them with three local helpers, so it would add a
        second style and a dependency without a new guarantee; `userEvent` is the only thing missed, and the
        `click` + `detectChanges` + `whenStable` pair covers the interactions the components have
-   [x] No spec asserts a CSS class any more: the tests that only checked a modifier or state class are gone,
        and the ones that checked a state now read `aria-current` / `aria-expanded`, added to `left-menu` for it
-   [x] Shared test helpers in `testing/dom.ts` (`renderComponent`, `settle`, `queryAll`, `textsOf`, `buttonByName`,
        `queryButton`), imported as `@testing/dom` by 68 specs; the copies each spec kept, and the five per-spec
        `ResizeObserver` mocks, are gone (300 lines less)
-   [x] No spec locates an element by class any more: every locator is a role, an `aria-*` attribute or visible
        text, and the templates gained the ARIA they lacked (`table` / `row` / `cell`, `list` / `listitem`, `tree` /
        `treeitem`, `searchbox`, `aria-expanded` on submenus and groups)
-   [x] The submenu chevron of `left-menu` and the toggle of the property tree were decorative for assistive
        technology: a `left-menu` branch with its own action gets a sibling toggle button laid over its chevron,
        and a tree row expands and collapses with `ArrowRight` / `ArrowLeft`, as the ARIA tree pattern expects (a
        button beside a `treeitem` would not be a valid child of the `tree`). The look is unchanged

What the pilot cost, and what it changed beyond the plan:

-   **The config was mutable.** `TabsConfig.setActiveTab` wrote into the config the component received, exactly
    what the rules forbid. The component now owns the active tab and reports through `onTabChange`; the config
    carries the initial value only. Nothing outside the module called it, so the break is cheap here — other
    modules may not be so lucky.
-   **`linkedSignal` is the tool for input-derived writable state.** It resets when the config instance is
    replaced, which is precisely the old setter's behaviour.
-   **`unicorn/consistent-function-scoping` had to go.** It flags every `computed()` and `linkedSignal()` class
    field as hoistable, so it is incompatible with the standard we adopted.
-   **stylelint needed keyword allowances** (`solid`, `ease`, …) before a properly migrated file could come out
    clean: `border: var(--x) solid var(--y)` was being reported as a literal.
-   **A style-guide has to migrate with its module.** Under `OnPush`, plain fields written from a callback never
    repaint, so its demo state has to become signals too.
-   **Tests: 23 to 15**, covering the same behaviour through the rendered output instead of internal state.
-   **README: 145 lines to 75**, with the overflow strategy moved out of a code comment into it.

Rough cost per module, from this one: a primitive like `breadcrumb` or `pagination` is smaller; `form`,
`table`, `page` and `properties-menu` are several times larger and will each surface their own version of the
mutable-config question.

### S6 - Migration _(done)_

A scan for the pattern the pilot uncovered says the API breaks are contained: only `pagination`
(`setPage`, `setPageSize`, `setTotalItems`) and `form` (`setInitialValue`) have a model that writes into
itself. What looked like the same thing in `properties-menu`, `table` and `tree` is a service's own signal,
a callback field and dialog callbacks.

-   [x] The remaining modules, one at a time; the internal `button` was the last one on `@Input`
-   [x] `properties-menu`: callbacks on the config, a shared `internal/option-picker`, signals and tokens across
        the root, groups, list, tree and the eleven fields, one README
-   [x] `badge` is a component with a `BadgeConfig`; `header`, `table` and `properties-menu` render theirs through it
-   [x] Translation keys to kebab-case
-   [x] Trim module READMEs to the agreed shape: title, usage, config table, behaviour sections, texts or theming
-   [x] `:host-context(body.dark)` only survives for non-token swaps: the inverted icons of `footer` and `login`, the
        `color-scheme` of the tree dialog

### S7 - Release

The next version is 1.2.0: the public API breaks (callbacks instead of outputs, `BeyBadgeConfig`, kebab-case
translation keys, the style-guide entry point) go out under a minor because nothing is at 1.0 for real yet, and
the change-log lists every break.

-   [x] Scripts matched to the Jenkins stages (Lint → `lint`, Test → `test:ci`, Build → `build`): `lint` runs
        ESLint, stylelint, `check-tokens` and `check-style-guides`; `build` stops running the tests, which the
        Test stage already runs; `verify` stays as the local shortcut
-   [x] Change-log: `[Unreleased]` completed with every S6 break and renamed to `[1.2.0]`; `[1.1.0]` dated
-   [x] Coverage thresholds raised to just under today's numbers (90 / 77 / 85 / 90), as S2 intended
-   [x] `release/1.2.0`, version bump, merge to `main` and `develop`, tag `v1.2.0`
-   [x] Consumers adapted: `document-builder-front` and `angular-components-demo` build and pass their tests
        against 1.2.0; `page` gained `onValueChange` and `left-menu` a title size variable for what they needed

Publishing already runs on Jenkins, configured on the server — there is no `Jenkinsfile` in the repo by design.
Snapshots per branch, `latest` from `main`, as described in the README.

### After 1.2.0

-   [x] `check-translations`: a key segment that is not kebab-case fails, and the translation scripts are the same
        in every repo: `bey-check-translations`, `bey-sort-translations` and `bey-merge-translations` from
        `@beyonda-labs/base-config`
-   [x] `BeyPageConfig` generic over the form value, so a typed `BeyPageFormConfig<T>` fits without a cast
-   [x] `*.model.ts` holds contracts and definitions only: `resolveRule` and the tree searches of the tree dialog
        moved to function modules with their specs, the default action type of a page zone is a table, the
        `types/` folders of `pdf-viewer` and `properties-menu` became model files, and `**/*.model.ts` is out of the
        coverage, with the thresholds set again on what remains (88 / 74 / 84 / 88)
-   [x] `eslint-plugin-perfectionist` through base-config (`eslint.sort-declarations` and `eslint.model-files`, no
        skip left): `sort-modules`, `sort-interfaces`, `sort-object-types` and `sort-enums` everywhere and
        `sort-classes` in model files. No enum with implicit values was reordered and no `Object.values` depended
        on the order
-   [x] `sort-classes` for the order inside a component, a directive or a service through base-config
        (`eslint.class-order`): inputs, outputs, public properties, private state, injected dependencies,
        constructor, lifecycle hooks, public methods, private methods
-   [x] `ModalTreeConfig` is plain data: the dialog owns the selection and the open branches, and the caller closes
        it through the `BsModalRef` that `open` returns
-   [x] Function modules have no technical suffix and live next to what they work on, as
        `rules/model-library/function-module.md` names them: `properties-menu/utils` moved into its `models/`, the drop
        position type and the variable icon into model files, and every module has its spec

### Front review

What `document-builder-front` did by hand that belongs in the library.

-   [x] `BeyPageConfig` typed by its rows, the `Single` action scope, category rows with their own `loadRow`, and rows
        completed with empty cells
-   [x] Date and tags table cells
-   [x] `beyFormatBytes` and `beyToKeySegment` public, in the new `utilities` layer
-   [x] File preview dialog, compact PDF toolbar and unsaved-changes guard
-   [x] `app-layout` navigates to `route` by itself
-   [x] `properties-menu` keeps the user's state across config replacements, and labels take translation parameters
-   [x] Form rules for `isRequired`, signal rules and validators, and option fields that drop an unlisted value
-   [x] `provideBeyApp` and the style guide loading its own translations
-   [x] The categories form value typed by a fourth generic on `BeyPageConfig`, `BeyPageTableConfig` and
        `BeyPageCategoriesConfig`
-   [x] `labelParameters` on `BeyTab` and on the top-level tabs of `properties-menu`
-   [x] `validators` on autocomplete, chips, file and password fields, typed as custom validators where the value is
        not text
-   [x] `ariaLabel` on `ButtonConfig`, so icon-only header actions, the header overflow toggle and the login
        providers have an accessible name
-   [x] The compact PDF toolbar uses `bey-button`s with `ButtonType.IconOutline`, a bordered, fixed-size icon square
        with the toolbar's colours
-   [x] Every `bey-button` type and the Bootstrap radius utilities follow the `--bey-radius-*` tokens
-   [x] `properties-menu` fields are named by their translated label, through a `<label for>` tied to a unique id
-   [x] The library's own specs take `provideBeyTesting` and the fakes of the testing entry, or the real service over
        them; only a module's own internals (page, login) and the ngx-bootstrap / ngx-toastr layer under the service a
        spec tests stay mocked
-   [ ] `BeyModalTreeService` has no fake, so `page-actions.service.spec.ts` still mocks it by hand; a
        `BeyFakeModalTreeService` would reverse the choice that `provideBeyTesting` opens the tree dialog for real
-   [ ] Error texts the HTTP service resolves oddly, kept as they were: a `message` without translation shows its raw key;
        a range with both limits null reads `-max`; an unknown `errorCode` gets the default title while an empty body or a
        network error gets `unknown`; a `getBlob` error always shows `unknown`, since its body is a Blob
-   [x] The session, theme, app and environment services have no `docs/<module>-readme.md`
-   [ ] `SearchField.getOperators()` is behaviour in a model, and `BadgeConfig.translate` is a boolean without the
        `is` prefix; both fixes rename or move a public member
-   [x] The tree chevron has no role or name (it is mouse only), so the specs reach it through its markup
-   [ ] `search.component.css` needs a `stylelint-disable` because it styles Bootstrap's `.form-select` and
        `.form-control`; styling its own `bey-search-*` classes would drop it
-   [x] `BeyHttpService` as one typed, cold channel: the request leaves on subscribe and is cancelled on
        unsubscribe, emits `T`, and propagates the error after the modal; `onSuccess` / `onError` are gone,
        `handleError`, `successToast` and `loading` stay, `provideBeyHttp` (inside `provideBeyApp` and
        `provideBeyTesting`) silences the unhandled HTTP errors the modal already showed, and the page loads through
        `switchMap`, so a stale response never overwrites a newer one
-   [x] `isRouteBreadcrumbEnabled` turns the route breadcrumb off
-   [x] `BeyAppLayoutConfig` keeps the footer fields as its own, so a spread copies it whole, and `icon` is optional
        on the app-layout actions

---

## Features

### Form

-   [x] Field types: `select`, `checkbox`, `radio`, `textarea`, `date`, `text`, `number`
-   [x] Advanced validators (`email`, `url`, `custom sync`, `async`)
-   [x] Accessibility (`aria-required`, `aria-invalid`, `aria-label`) across all fields

### Core UI

-   [ ] Layout: `card`, `panel`
-   [x] Feedback: `toast`, `loading spinner` (inline + overlay + service)
-   [ ] Feedback: `alert`, `progress bar`
-   [x] Modals (info, warning, error, confirmation via service)
-   [ ] Drawers
-   [ ] Pdf viewer: find text in the document from the compact toolbar, with its own search field, next and previous
        match and a match count; the find bar of pdf.js is off outside its full toolbar
-   [x] File preview dialog (`BeyFilePreviewService`): laid out like a modal form, with a cancel button in its footer;
        a PDF shows the compact toolbar with a download button and an image fits without a scrollbar

### Data and navigation

-   [ ] `page`: remember the search and the selection when the user comes back to a page (the old
        registry was removed unfinished)

-   [x] Table / grid (configurable columns, row selection)
-   [ ] Table: sort by clicking the header of a column, sent as the `sort` of the search; today `tableConfig.order`
        fixes one order for the whole page
-   [ ] Table / grid: filters
-   [x] Pagination
-   [x] Tabs
-   [x] Breadcrumb
-   [x] Sidebar (`left-menu` with grouped actions, sub-actions and collapse)
-   [x] Header (configurable left / right actions)

### Page

-   [ ] Rethink the trash view: say which folder each row was in, and where a restored row goes back to
-   [ ] _(low priority)_ Move rows by dragging them onto a folder
-   [ ] _(low priority)_ The number of rows in each folder
-   [ ] _(low priority)_ Saved views: tabs that apply a search with its filters (templates / blocks)
-   [ ] _(low priority)_ Search every folder at once, naming the folder of each result; needs the matching search
        in express-components' base-entity
-   [ ] _(low priority)_ Undo right after a delete, from its toast
-   [ ] _(very low priority)_ Favourite and recent rows

### Rich interactions

-   [ ] Text editor
-   [ ] Drag & drop and reorderable lists
-   [ ] File board / manager

### Delivery

-   [x] Demo component (`style-guide` with simple / composite sections)
-   ~~Storybook~~ — decided against. It would solve the packaging boundary for free and give visual
    regression, but its main draw, controls generated from the component inputs, does not work with a
    single `config` object input, so it changes the tool without changing the guarantee. Revisit only if
    automated visual diffing becomes something we would actually run.
-   [ ] API docs (TypeDoc)

### Outside the original roadmap

-   [x] `app-layout` (full layout with integrated left-menu, breadcrumb and footer)
-   [x] `login` (authentication with light/dark theme and optional OAuth providers)
-   [x] `footer`
-   [x] `floating-preferences` (theme and language selector)
