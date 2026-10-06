# Change Log

## [Unreleased]

### Added

-   Page module: `size` on `BeyPageFormConfig` opens its create and edit forms in that `BeyModalFormSize` (`Large` by default).
-   Services: the HTTP error modal explains `attachments.replace-type-mismatch` and `attachments.content-not-set`, the refusals of replacing the file of an attachment.
-   Properties menu module: `withDisabled(disabled?)` on every field returns a disabled copy, as `withValue` does with a value, to show a menu read-only.
-   Pdf viewer module: `isDownloadable` adds a download button at the end of the compact toolbar, saving the document as `filenameForDownload`.
-   Page module: after a restore, an info toast lists the rows the backend renamed because another row already had their name (`renamed` in the answer of `PUT {baseUrl}/trash`).
-   Form module: `label` on `BeyFormSection` and on every field overrides the title or the label read from the prefix, for a form built from data, such as one field per variable of a document.
-   Left menu module: a branch with its own `action` gets a submenu toggle over its chevron, reachable from the keyboard and named with `angular-components.left-menu.submenu`.
-   Page module: `BeyPageConfig` and `BeyPageConfigParameters` take the form value type, so a typed `BeyPageFormConfig<T>` fits without `<unknown>`.
-   Properties menu module: tree rows expand with `ArrowRight` and collapse with `ArrowLeft`.
-   Properties menu module: the chevron of a tree row is a button named `angular-components.properties-menu.tree.expand` or
    `.collapse`, and a row, now a `treeitem` that holds it, is selected with `Enter` or `Space` as well as a click.
-   App layout module: `BeyAppLayoutBottomAction` takes an optional `route`.
-   File preview module: `BeyFilePreviewService.open(config)` shows a PDF or an image from a `Blob` or a URL in a dialog, driven by `BeyFilePreviewConfig` and `BeyFilePreviewType`, and releases the object URL it creates.
-   Form module: `isRequired` takes a rule, like `isHidden` and `isDisabled`; the required validator, the marker and `aria-required` follow it as the form value changes.
-   Form module: a rule can be a signal, and a custom validator runs again when a signal it reads or the form value changes, so data that arrives after the config is built reaches options and validators without mutable references.
-   Modal module: `beyUnsavedChangesGuard` and `BeyUnsavedChangesService.track(hasChanges, config?)` ask before leaving a route with unsaved changes and warn on `beforeunload`, with default texts overridable through `BeyUnsavedChangesConfig`.
-   Page module: `BeyPageConfig<TValue, TItem, TCategory>` types its rows, so `loadRow`, `onSelectionChange`, action handlers, `buildSections`, `toFormValue`, `afterCreate`, `onDataLoaded` and `BeyPageHandle` see the real entity without casts.
-   Page module: `BeyPageActionScope.Single`, shown while exactly one selected row lists the key; its handler receives that row.
-   Page module: `loadRow(category, viewMode)` on `BeyPageCategoriesConfig` draws the category rows; without it a category row shows its name as a link that opens it.
-   Pdf viewer module: `toolbar: BeyPdfViewerToolbar.Compact` shows a compact toolbar with zoom within `minZoom`–`maxZoom` by the new `zoomStep`, the current page, and a `bey-pdf-viewer-status` slot, its controls named by translated labels.
-   Properties menu module: `labelParameters` on `BeyPropertyGroup`, `BeyPropertyGroupTab` and `BeyPropertyTreeNode`, passed to the translate pipe with the label key.
-   Table module: `BeyDateTableCell`, formatted in the `LOCALE_ID` locale (`mediumDate` unless `format` says otherwise), and `BeyTagsTableCell`, plain strings as untranslated outline badges.
-   Table module: a row with fewer cells than columns is completed with empty cells.
-   Page module: `duplicate` and `change-status` standard actions: a modal form for the name of the copy or for one of the statuses the current one reaches (`BeyPageStatusConfig`), sent to `POST {baseUrl}/{id}/duplicate` and `POST {baseUrl}/{id}/status` with their success toast and a reload; `BeyPageDuplicationConfig` names the field the copy is named by.
-   Table and form modules: `tooltipItems` on every table cell and on the items of `BeyFormInfoField` shows the tooltip as a list, with the `tooltip` as its title.
-   Page module: `openEdit(row)` on `BeyPageHandle` opens the edit form of a row, or the categories form of a category, as the `edit` action does, so a cell can open it.
-   Page module: `empty-trash` standard action, shown in the trash while the backend lists it, asks with `<prefix>.modal.empty-trash` and sends `DELETE {baseUrl}/trash/all`.
-   Services: the HTTP error modal explains `action-unavailable` and `invalid-transition`.
-   Table module: `icon` on `BeyTextTableCell` and `BeyLinkTableCell`, a FontAwesome icon drawn before the content and hidden from screen readers; on a link it is part of the link.
-   Table module: `BeyTableColumnParameters`, `BeyTableConfigParameters` and the `Bey*TableCellParameters` types are exported.
-   Services: `provideBeyApp` registers the HTTP client with the session interceptor, the environment, the session, the modal, the toast and the translations loader in one provider, typed by `BeyAppConfig`.
-   Utilities: `beyFormatBytes` formats a size in bytes as the file field shows it (`1.5 KB`), and `beyToKeySegment` turns an identifier into the kebab-case segment the library builds its translation keys from.
-   Style guide: `bey-style-guide` loads its own translations from `assets/angular-components/i18n-style-guide/` for the current language and every language change.
-   Page module: `BeyPageCategoriesConfig<TCategory, TCategoryValue>` types the categories form value, carried through `BeyPageTableConfig` and `BeyPageConfig<TValue, TItem, TCategory, TCategoryValue>`, so the categories form's `toItem` reads it without a cast; it defaults to `unknown`.
-   App layout module: `isRouteBreadcrumbEnabled` on `BeyAppLayoutConfig` (`true` by default); `false` leaves the breadcrumb to the consumer on navigation and on language changes, while the menu still follows the route and `onRouteActivated` still runs.
-   App layout module: `BeyAppLayoutConfig` keeps `iconSrc`, `productName`, `orgName`, `privacyUrl` and `termsUrl` as fields next to `footerConfig`, so a config spread into a new one is a full copy.
-   App layout module: `BeyAppLayoutConfigParameters`, `BeyAppLayoutTopActionParameters`, `BeyAppLayoutBottomActionParameters` and `BeyAppLayoutBreadcrumbItemParameters` are exported.
-   Tabs module: `labelParameters` on `BeyTab`, passed to the translate pipe with the label key in the tab bar and in the overflow menu.
-   Properties menu module: `labelParameters` on `BeyPropertyTab`, passed on to its tab in the menu's tab bar.
-   Testing: secondary entry point `@beyonda-labs/angular-components/testing` for the specs of a consuming app; `provideBeyTesting(config?)`, typed by `BeyTestingConfig`, registers the HTTP client backed by `HttpTestingController`, a test environment, the session over in-memory storage (signed in with `user`), ngx-translate without a loader or with `translations` per language, the ngx-bootstrap modals, and the fakes in place of the real services.
-   Testing: `BeyFakeModalService`, `BeyFakeToastService`, `BeyFakeModalFormService`, `BeyFakeFilePreviewService` and `BeyFakeStorageService` record what they are asked for in signals, `setConfirmationAnswer` sets what a confirmation emits, and the DOM helpers `beyRenderComponent`, `beySettle`, `beyButtonByName`, `beyQueryButton`, `beyQueryAll`, `beyTextsOf` and `beyHostOf` are public.
-   Testing: `beyControlByName`, `beyQueryControl` and `beyAccessibleName` find a form control by the name a user hears: its `aria-labelledby`, its `aria-label` or its `<label>`.
-   Page module: `beyPageStandardAction(key, overrides?)` builds a standard action with its scope, zone, type and icon, and `beyPageAddAction(overrides?)` the `add-group` button holding `create` and `create-category`; any field but the key can be overridden.
-   Page module: `confirmation(items, confirmation)` on a `delete`, `delete-category` or `delete-trash-item` action returns the confirmation to ask with, or an observable of it, so a page can warn about rows in use and keep the standard request, toast and reload.
-   Page module: `openForm(config, submit)` on `BeyPageHandle` opens a modal form for a custom action, sends `submit(value)` on save, and closes and reloads the page once the request answers.
-   Form module: `BeyModalFormConfig` keeps `cancelLabel` and `submitLabel`, so a config spread into a new one is a full copy.
-   Form module: `BeyModalFormService.openWithRequest(config, submit)` opens a modal form whose submit sends a request and closes once it answers, for any screen; `BeyPageHandle.openForm` is built on it, and `BeyFakeModalFormService` does the same in specs.
-   Services: `provideBeyHttp()`, included in `provideBeyApp` and `provideBeyTesting`, keeps rxjs from reporting an HTTP error the service already showed.
-   Form module: a validator error shaped as `BeyFormFieldError` (`{ messageKey, messageParameters? }`) is shown translated under its field once touched, sync or async; the file field drops its size hint meanwhile.
-   Page module: `copySeparator` and `nameValidators` on `BeyPageDuplicationConfig` join the copy suffix to the name and check the name of the copy, for names that allow no space (`client_copy`).
-   Page module: `confirmSave(value, item?)` on `BeyPageFormConfig` answers a confirmation the page asks over the form before a create or an edit is sent, typed as `BeyPageSaveConfirmation`.
-   Form module: `isFreeTextAllowed` on `BeyFormAutocompleteField` takes the typed text as the value and keeps the options as suggestions, so a value outside them stays.
-   Form module: `BeyFormListField` shows read-only texts as a list, from an array or a signal, with its placeholder while empty; it grows with its texts and leaves the scroll to the form.
-   Services: the HTTP error modal explains the `attachments.*` errors of express-components: `content-already-set`, `content-too-large`, `duplicate-content`, `empty-content` and `unsupported-type`.

### Changed

-   Header module: `badges`, a list, replaces `badge`, so a title can carry several, such as a status and a read-only mark.
-   Pdf viewer module: without the toolbar of pdf.js (`None`, `Compact`) the viewer turns off its keyboard shortcuts, its context menu and opening a dropped file, so no half-built find bar or menu shows up.
-   File preview module: the dialog looks like a modal form: an icon of the file type, "Preview" over the title and the file name, the content framed below, and a cancel button in a footer; a PDF shows the compact toolbar with a download button, and an image shrinks to fit without a scrollbar.
-   Page module: `isTrashEnabled` on `BeyPageTableConfig` replaces `useTrash` on `BeyPageCategoriesConfig`, so a page without categories gets the trash view too.
-   Form module: a select field shows its placeholder muted, as the inputs do, until an option is chosen, and its placeholder option is muted in the list too, so neither reads as a real option; picking that option empties the field.
-   Services: `BeyHttpService` reads the reason of an error from `messageKey` in the body instead of `message`, as express-components now sends it, and `CustomErrorResponse` carries the `details` of the error.
-   Services: `BeyHttpService` returns a cold, typed observable: the request leaves on subscribe, each subscription sends its own request and unsubscribing cancels it; after the error modal (or `handleError`) the `HttpErrorResponse` reaches the subscriber instead of completing empty. `onSuccess` and `onError` are removed from `BeyHttpRequestOptions`: subscribe instead.
-   `BeyCellType`, `BeyLoadingSize`, `BeyModalFormSize` and `BeyModalTreeSize` list their members alphabetically, so `Object.values` returns them in that order.
-   Tree module: `BeyModalTreeConfig` is plain data: `close`, `confirm`, `getSelectedNode`, `getTitle`, `hasSelection` and `closeHandler` are gone, `title` always holds a value (`<prefix>.title` by default), and the dialog closes through the `BsModalRef` that `BeyModalTreeService.open` returns.
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
-   App layout module: an action with a `route` navigates to it when used from the menu; an action with its own `action` runs it instead, and its `route` only marks it active.
-   Form module: a select, radio or autocomplete clears its value when its options change and no longer list it.
-   Form module: `BeyFormField.isRequired` is typed `BeyFormRule<boolean>` instead of `boolean`.
-   Page module: an action `handler` always receives an array, `[]` for `Global` and `Group` instead of `undefined`; on a page with categories it receives only the selected rows that are not categories, and it is hidden while only categories are selected.
-   Page module: rows whose `typeField` says `category` no longer go through the table's `loadRow` but through `categoriesConfig.loadRow`, or the default name link.
-   Pdf viewer module: `showToolbar` is replaced by `toolbar`, a `BeyPdfViewerToolbar` (`None` by default, `Full` for the toolbar of pdf.js).
-   Properties menu module: a new config keeps what the user expanded, the open tabs and the selected tree node, matched by id, unless the config changes that value; a node the config selects opens its ancestors.
-   `BeyCellType` gains `Date` and `Tags`, and `BeyPageActionScope` gains `Single`.
-   App layout module: `icon` is optional on `BeyAppLayoutTopAction` and `BeyAppLayoutBottomAction`.
-   Form module: the number, checkbox, chips and file fields type `validators` as `BeyFormFieldCustomValidator[]`, so a length, pattern, email or url validator on them no longer compiles.
-   Pdf viewer module: the zoom buttons of the compact toolbar are `bey-button`s with a bordered icon-square variant and keep their look; their name shows as the library tooltip instead of the browser's `title`, also while disabled.
-   Style guide: the list and tree demos show the selected item on the page instead of logging it, and the tree demo highlights the node the user picks.

### Fixed

-   Loading module: the full-screen overlay sits over the dialogs (`--bey-z-loading`), so a request sent from a modal form shows its loading instead of leaving the form still until it answers.
-   Pdf viewer module: the compact toolbar reads in the dark theme: the page field takes the text, border and background of the theme instead of dark text on black, the buttons show their icon in the main text color, and a disabled button only fades.
-   Table module: the rows are drawn again when the language changes, keeping the selection, so texts a `loadRow` translates itself no longer stay in the previous language.
-   Form module: the options of an autocomplete field keep their background, border and hover inside a modal: the panel moves to the body and lost the variables its host declared.
-   Page module: a new load of the list cancels the one still out, so a slow response no longer overwrites the rows of a newer page, search or category.
-   Form module: `stretch` buttons share the full width in a row, and the sections no longer show a horizontal scroll.
-   Tabs module: tabs whose labels widen after the first paint (translations that load late, a language switch, a web font) move into the overflow menu instead of spilling out of a narrow bar.
-   Style guide: the login example scrolls with the library's thin scrollbar.
-   Tree module: picking a node in the tree dialog no longer reopens the branches the user collapsed.
-   App layout module: a navigation that a guard cancels, or that fails, no longer leaves the menu and the breadcrumb on the page that was not reached.
-   Form module: a custom validator that reads a signal no longer rebuilds the form, and loses what was typed, when that signal changes.
-   Page module: `edit-category` is offered only with exactly one row selected, as `edit` already was.
-   Page module: `move` recognises the selected categories through `typeField` instead of a hard-coded `type`.
-   Header module: icon-only actions are named by the label key a text action would show, and the overflow toggle by `angular-components.header.menu`, so screen readers announce them.
-   Login module: the provider buttons are named after their provider (`angular-components.login.provider.<id>`).
-   Form module: the autocomplete, chips, file and password fields apply their `validators`, which were silently ignored; the file field runs them together with `accept` and `maxSizeBytes`, and the chips field shows its invalid state once its input is left.
-   Properties menu module: every field control is named by its translated label, through a `<label for>` tied to a unique id or an `aria-label` where no label shows, instead of the raw key; the extra controls of a field (hex value, array entries and their remove buttons, the file button) get their own names, and the attachment upload is reachable from the keyboard.
-   Pagination module: the page size select and the page input are named by their translated labels instead of fixed English `aria-label`s.
-   Styles: every `bey-button` type and the Bootstrap radius utilities follow the `--bey-radius-*` tokens; the primary, secondary, tertiary and link-secondary buttons ignored `--bey-radius-sm`.

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

-   Services: `BeyHttpService` reads the reason of an error from `messageKey` in the body instead of `message`, as express-components now sends it, and `CustomErrorResponse` carries the `details` of the error.
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

-   Services: `BeyHttpService` reads the reason of an error from `messageKey` in the body instead of `message`, as express-components now sends it, and `CustomErrorResponse` carries the `details` of the error.
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
