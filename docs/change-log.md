# Change Log

## [Unreleased]

### Changed

-   Form module: the key segments derived from section and field identifiers are kebab-case (`valueString` reads `value-string.label`); translation files with camelCase segments must be renamed.
-   App layout module: the menu and breadcrumb keys derived from action keys are kebab-case (`monthlyReports` reads `actions.monthly-reports.label`); translation files with camelCase segments must be renamed.
-   Header module: the default keys derived from action keys are kebab-case (`saveDraft` reads `actions.save-draft.label`); translation files with camelCase segments must be renamed.
-   Left menu module: the default keys derived from action keys are kebab-case (`userSettings` reads `actions.user-settings.label`); translation files with camelCase segments must be renamed.
-   Page module: the keys derived from action, column and search field keys are kebab-case (`createdAt` reads `table.tooltips.created-at`); translation files with camelCase segments must be renamed.
-   Properties menu module: the default keys derived from tab, group, field, tree and list ids are kebab-case (`fontFamily` reads `fields.font-family.label`), and the action button tooltip is `fields.<id>.action-button.tooltip`; translation files with camelCase segments must be renamed.
-   Search module: the label keys derived from field keys are kebab-case (`createdBy` reads `fields.created-by`); translation files with camelCase segments must be renamed.
-   Table module: the header keys derived from column keys are kebab-case (`createdAt` reads `columns.created-at`); translation files with camelCase segments must be renamed.
-   Tabs module: the default keys derived from tab keys are kebab-case (`billingDetails` reads `tabs.billing-details.label`); translation files with camelCase segments must be renamed.
-   Tree module: the default label keys derived from node keys are kebab-case (`sharedFolder` reads `nodes.shared-folder.label`); translation files with camelCase segments must be renamed.

### Fixed

-   Form module: `stretch` buttons share the full width in a row, and the sections no longer show a horizontal scroll.

## [1.2.0] - 2026-09-26

### Added

-   Badge module: `bey-badge` with `BeyBadgeConfig` and `BeyBadgeVariant`.
-   Form module: `BeyFormHandle` handed to `onReady`, `onSubmit`, `onValueChange` and the button actions.
-   Form module: `onStepChange` callback, and `BeyFormComponent` exported.
-   Pdf viewer module: `BeyPdfViewerHandle` handed to `onReady`.
-   Page module: `onValueChange(value, handle)` on `BeyPageFormConfig`, forwarded to the create and edit form.
-   Left menu module: `--bey-left-menu-title-font-size` to size the title.
-   Properties menu module: `BeyPropertiesMenuHeaderConfig`, and `variables` as an input.
-   Left menu module: `aria-current` on the active action and `aria-expanded` on the toggle.
-   Styles: `tokens.css`, the design language as `--bey-*` custom properties, with dark mode under `body.dark`.
-   Style guide: secondary entry point `@beyonda-labs/angular-components/style-guide`.
-   Package: `sideEffects` limited to the CSS files.

### Changed

-   Every component: `config` is a required signal input, read as initial state and never written to; `OnPush`.
-   Every public export carries the `Bey` prefix (`BeyFooterConfig`, `BEY_ENVIRONMENT_CONFIG`).
-   Translation keys are kebab-case (`app-layout`, `pdf-viewer`, `greater-than`, `no-file-selected`).
-   Tabs module: the component owns the active tab and reports it through `onTabChange`.
-   Pagination module: `onPageChange` and `onPageSizeChange` receive the new value instead of the config.
-   Form module: `BeyFormConfig` is immutable; `onSubmit` and `onValueChange` receive the handle.
-   Table module: `BeyTableConfig<T>` requires its item type.
-   Header and table modules: badges are `BeyBadgeConfig`.
-   Left menu module: the expanded state is reported through `onExpandedChange`.
-   Login module: `translatePrefix` is `prefix`.
-   Pdf viewer module: every event is a callback on the config; `toolbarButtons` takes a class instance.
-   Properties menu module: every event is a callback on `BeyPropertiesMenuConfig`.
-   Properties menu module: `options`, `variables` and `actions` take class instances; `PropertyTabAddRequested`
    is `BeyPropertyTabAdd`.
-   Styles: every custom property is `--bey-*` (`--text-primary` → `--bey-text-primary`); `index.css` imports
    `tokens.css` instead of `color-palette.css`.
-   Styles: no `!important` left except `.text-dark` and `.text-muted`.
-   Styles: class names are `bey-<module>-<part>`, variants `bey-x--variant`, states `is-*` / `has-*`.

### Removed

-   Tabs module: `setActiveTab()`.
-   Pagination module: `setPage()`, `setPageSize()`, `setTotalItems()`, `refresh()` and `$loadPagination`.
-   Form module: `getInitialValue()`, `getValue()`, `patchValue()`, `setInitialValue()` and `onFormGroupAdded`.
-   Table module: `BeyTableRow`.
-   Header, table and properties menu modules: `BeyHeaderBadge`, `BeyTableBadge` and `BeyPropertyBadge`.
-   Left menu module: the `expandedChange` output, and `styles` on `BeyLeftMenuTitle`.
-   Pdf viewer module: the outputs and the public `goToPage` / `setZoom` / `rotate` methods.
-   Properties menu module: the outputs, `BeyPropertiesMenuService` and `BeyPropertyVariableService`.
-   Page module: `BeyPageService` and `BeyPageStateRegistry`.
-   Styles: `badge.css` and `color-palette.css`.
-   Style guide: `BeyStyleGuideComponent` from the primary entry point.
-   Package: the `sass` devDependency.

## [1.1.0] - 2026-09-01

### Added

-   Header module: support for sub-actions.
-   Form module: chips field.
-   Table module: badge cell.
-   Page module:
    -   Actions can render as a dropdown (`subActions`, `PageActionScope.Group`), matching the header module's sub-actions.
    -   Category support: browsing (drill-down navigation with breadcrumb), trash view (restore/delete) and `move` action for items and categories via a tree-picker modal.
-   Tree module:
    -   `ModalTreeService` to pick a node from the full tree inside a dialog.
    -   Tooltip on node labels when truncated.
-   Tabs module: segmented (pill) variant, in addition to the existing underline style.
-   Breadcrumb module: `isTranslationKey` on `BreadcrumbItem` to resolve a label as a raw i18n key, ignoring the prefix.
-   Search module:
    -   `Select` field type for bounded/enum-like fields: renders a dropdown of the configured `options` instead of free text, with `equals`/`notEquals` operators.
    -   `Tags` field type for array-of-strings fields: `contains`/`notContains` match a whole array element, not a substring.
-   Properties menu module:
    -   Info field for read-only values, and attachment field to pick an attachment by id or upload a file (reported through the new `attachmentUpload` output).
    -   Groups can split their fields into tabs, and any field can take half a row so two of them share it.
    -   `searchable` on select fields, and `iconClasses` on list items to color an icon per item.
-   Header module: icon-only action type, with the label shown as a tooltip.
-   Styles: `bey-text-danger`, `bey-text-warning` and `bey-text-success` utility classes.
-   Form module: file field, validating the accepted mime types and the maximum size before any upload.
-   Http service: `upload()` sends raw bytes reporting progress, and `getBlob()` fetches a response as bytes instead of JSON.
-   Page module: `afterCreate` on the form config runs a follow-up request before the create modal closes, for entities that take more than one call to create.
-   Form module: autocomplete field, a select whose options are filtered by typing, for lists too long for a native dropdown.
-   Properties menu module: a list card can copy a value to the clipboard and expose extra actions through
    `listItemAction`.
-   Properties menu module: a searchable select field can offer a variable picker too, for a field whose value may
    be named by a variable.
-   Properties menu module: the attachment field can offer a variable picker, writing the chosen variable as a
    {{ name }} expression; its unused image preview is gone.
-   Properties menu module: list cards can carry badges, a remove action and an expandable body of summary rows
    (read-only value, badge or a real field) opened from their header, so an entity can be a card and the group
    header can mean grouping.

-   Properties menu module: tree nodes can be dragged to reorder or reparent them, reporting the move through
    `treeDrop`; what each node accepts is declared per drag with `acceptsDrop`, `draggable`, `dropDisabled` and
    the tree's `acceptsRootDrop`, so the library holds no nesting rules of its own.

-   Properties menu module: the attachment field checks the file type before uploading, as the form file field
    already did, instead of leaving it to the server to refuse it.

-   Pdf viewer module: new `bey-pdf-viewer`, wrapping `ngx-extended-pdf-viewer` with its native toolbar hidden and
    an imperative API (`goToPage`, `setZoom`, `rotate`) for building a custom one.
-   Properties menu module: new `bey-properties-menu`, a contextual property inspector with data-driven tabs, groups
    and typed fields.
-   Header module: optional `backAction` and `badge`, and a `variant` controlling the title size; the three action
    groups now render as a single end-aligned block instead of opposite sides.
-   Tabs module: tabs that do not fit the available width collapse into an overflow menu, keeping the active one
    visible.
-   App layout module: the left menu's expanded state persists through `AppLayoutService.setExpanded`; new
    `useBodyPadding`, and top/bottom actions accept their own `action` callback and `disabled`.
-   Left menu module: on an expanded parent action, clicking the label runs its action and the chevron toggles the
    submenu.
-   Floating preferences module: `usePill` renders the language and theme selectors without the floating pill
    wrapper, for embedding them elsewhere.
-   Footer module: renders the language and theme switcher inline.

### Changed

-   Page module: `PageFormConfig` and `ModalFormConfig` are generic over the form value type, so `onCreate` and
    `onEdit` receive a typed value instead of `unknown`.
-   Http service: requests configured with `loading`, `successToast` or `onSuccess` behave correctly when the caller
    also subscribes to the returned observable.
-   Properties menu module: every field that offers a variable now uses the same icon, taken from one shared
    constant instead of each field declaring its own.
-   Tooling: the package manager is now pnpm, pinned through `packageManager`.

### Fixed

-   List module: the space key typed inside a control of a card is no longer swallowed — the card only reacts to it
    when the key lands on the card itself, so an input inside one accepts spaces and the card stops toggling.
-   Properties menu module: the searchable select panel is readable again — it painted its background and border
    from tokens that do not exist in the palette, so it rendered transparent over whatever sat behind it.
-   Properties menu module:
    -   The attachment field's upload and clear buttons now match the size and shape of the other property fields' buttons.
    -   Long variable names no longer overflow the panel: group headers and list items truncate with an ellipsis —
        the full name stays available as a tooltip — and field labels wrap.
-   Properties menu module: a list item label now interpolates the parameters it carries, so a parameterised
    message no longer shows its placeholders raw.
-   Form module: the autocomplete panel is no longer clipped by a scrollable ancestor such as a modal body.
-   Breadcrumb module: fixed the overflow-collapse not updating after the item list changed.
-   Form module:
    -   Modal form buttons no longer scroll with the field content — only the fields area scrolls internally (bounded by the modal), the buttons stay fixed and always visible.
    -   The scrollbar inside a modal form now follows the dark theme instead of always rendering with light colors.
    -   The submit button is now disabled while the form has no changes yet, mirroring the cancel button's existing behavior — previously it was only gated on validity, so an untouched but already-valid form could be "saved" with no changes.

## [1.0.0] - 2026-07-20

### Added

#### Components

-   **AppLayout** — main application layout with support for sidebar, header and footer
-   **Breadcrumb** — navigation breadcrumb indicator
-   **FloatingPreferences** — floating user preferences panel
-   **Footer** — configurable application footer
-   **Form** — reactive form with the following field types:
    -   `FieldText` — text input
    -   `FieldTextarea` — textarea input
    -   `FieldNumber` — numeric input
    -   `FieldDate` — date picker
    -   `FieldCheckbox` — checkbox input
    -   `FieldRadio` — radio button group
    -   `FieldSelect` — dropdown select
    -   `FieldPassword` — password input
-   **Header** — application header with support for actions and navigation
-   **LeftMenu** — sidebar menu with support for action groups and routes
-   **List** — vertical list of custom cards with content projection and a consistent shell
-   **Loading** — loading indicator (overlay and container)
-   **Login** — login screen with OAuth and registration support
-   **Modal** — modal dialog with info, confirmation and error types
-   **Page** — macro page component combining header, table, search, pagination and modal forms
-   **Pagination** — results pagination
-   **Search** — search bar with a main input and a filters panel for text, numeric and boolean filters
-   **Table** — data table with configurable cells and rows
-   **Tabs** — tab navigation
-   **Toast** — toast notifications
-   **Tree** — recursive tree with expand/collapse and single selection

#### Services

-   **HttpService** — HTTP client with loading, success toast and centralized error handling
-   **SessionService** — user session management with JWT, auth guard and interceptor
-   **LoadingService** — global loading state control
-   **ModalService** — programmatic modal opening
-   **FormService** — reactive form building and validation
-   **ThemeService** — application theme management
-   **ModalFormService** — programmatic modal form opening with unsaved-changes confirmation

#### Providers

-   `provideBeyEnvironment` — environment configuration (base URL, app name, etc.)
-   `provideBeySession` — session configuration (login routes, storage, etc.)
-   `provideBeyModal` — modal service registration

#### Assets

-   Global CSS styles with variables and Bootstrap overrides
-   Internationalization (i18n) files in English and Spanish
