# Change Log

## [1.1.0] - 2026-??-??

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
-   Properties menu module: list cards can carry badges, a remove action and an expandable body of summary rows
    (read-only value, badge or a real field), so an entity can be a card and the group header can mean grouping.

### Changed

-   Tooling: the package manager is now pnpm, pinned through `packageManager`.

### Fixed

-   Properties menu module:
    -   The attachment field's upload and clear buttons now match the size and shape of the other property fields' buttons.
    -   Long variable names no longer overflow the panel: group headers and list items truncate with an ellipsis —
        the full name stays available as a tooltip — and field labels wrap.
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
