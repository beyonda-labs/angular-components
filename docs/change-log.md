# Change Log

## [1.1.0] - 2026-??-??

### Added

-   Header module: support for sub-actions.
-   Form module: chips field.

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
