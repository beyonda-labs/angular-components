# Change Log

## [Unreleased]

### Added

-   Organizations module: `bey-organizations`, the superadmin's page over `/organizations` on `bey-page`: create and
    rename an organization, deactivate or reactivate it, and invite its first admin with the `adminRole` of the config.
-   Organizations module: the texts of the `organizations.existing-name` and `.not-found` errors.
-   Page module: `beyPageOrganizationColumn(overrides?)` and `beyPageOrganizationCell(row)` show the `organizationName`
    of a `BeyPageOrganizationItem`, only while `GET {baseUrl}/organizations` names two organizations or more.
-   Page module: `isOrganizationFilterEnabled` on `BeyPageTableSearchConfig` adds an "Organization" filter,
    `organizationId` `equals`, from the same answer and shown only with two organizations or more.
-   Users module: for a superadmin with an active organization or more, an organization column after the email, with
    "System" on the superadmins' rows (`table.system`), read from `GET {baseUrl}/organizations`.
-   Users module: for a superadmin with two active organizations or more, an organization filter, `organizationId`
    `equals`, with those organizations by name.
-   Users module: the invite form always asks a superadmin for the organization, required and chosen already when only
    one is active; a superadmin belongs to none, so nothing comes from the session.
-   Users module: the texts of the `users.superadmin-role-fixed` error.
-   HTTP service: the texts of the `entities.owner-required` error, a create with no user to own the row.
-   Session service: `organizationId` on `BeySessionUser`, read from the token; absent for a superadmin.
-   Login module: the texts of the `login.organization-inactive` error; the OAuth callback goes back to the login on
    `?error=organization-inactive`, as on any other error.

### Changed

-   Users module: `BeyUserRow` carries `organizationId` and `organizationName` when the server answers them to a
    superadmin, both `null` on the row of a superadmin.
-   Users module: the `users.superadmin-only` text speaks only of changing a superadmin account, since nobody grants
    nor removes the superadmin role any more.

### Fixed

-   Page module: the menus of the header open over the search toolbar again; the search sits in the new
    `--bey-z-toolbar` layer, over the sticky header of the table and under the menus.

## [1.4.0] - 2026-10-10

### Added

-   HTTP service: `postBlob(url, body, options?)` sends a `POST` and reads the response as a `Blob`, such as a PDF the
    server draws from the body; a failed one shows its reason like `getBlob`.
-   HTTP service: `withCredentials` on `BeyHttpRequestOptions` reaches `HttpClient` from every method, for an api on
    another origin.
-   Session service: `restore()` asks `accessControlUrl/refresh` for an access token through the refresh cookie,
    one request at a time and none again once it failed; the guards use it when there is no token.
-   Session service: `logout()` signs the user out at `accessControlUrl/logout`, then clears the session and goes to
    `loginRoute`, also when the request fails.
-   Login module: `login.account-locked` (with its `minutes`) and `login.invalid-origin` errors and titles, and
    `login.invalid-credentials-attempts-left` and `account.wrong-password-attempts-left`, which warn with the
    `attemptsLeft` and the `minutes` before the account locks.
-   Login module: a "Forgot your password?" view behind `isPasswordResetEnabled` on `BeyLoginConfig`, which sends
    `accessControlUrl/password/forgot` and confirms in neutral words; `?view=forgot-password` on the login route opens
    it.
-   Login module: `BeyLoginResetPasswordComponent`, `BeyLoginVerifyEmailComponent` and
    `BeyLoginAcceptInvitationComponent`, the pages of the emailed links in the look of the login; each reads `?token=`
    and opens the session the server answers.
-   Login module: a sign-in refused with `login.email-not-verified` offers to resend the verification email, and a
    registration answered with `{ verificationRequired: true }` asks to check the inbox; errors and titles for
    `login.account-inactive`, `login.email-not-verified`, `login.verification-not-sent` and `account.token-invalid`.
-   Login module: `BeyLoginConfigParameters` is exported.
-   Account data module: `bey-account-data`, the profile block of an app's account page: the email read-only and the
    name and surname saved with `PUT /account`, laid out by `fields` (`BeyAccountDataField`, `BeyAccountDataFieldKey`).
-   Password change module: `bey-password-change`, the password block of an app's account page, sent with
    `PUT /account/password`, which opens the session it answers, or how to set a password for an account without one.
-   Account service: the profile behind both blocks, asked for once while a request is on its way and again by every
    new block; `BeyAccountProfile` is exported.
-   Left menu module: `route` on `BeyLeftMenuUserInfo` turns the user at the foot of the menu into a link to it, named
    `angular-components.left-menu.open-account` and marked while it is the page; `bey-app-layout` passes it through.
-   Users module: `bey-users`, the users page on `bey-page` over the users module of express-components: invite, edit,
    change the status and resend the invitation, with roles labelled from `rolePrefix`.
-   Password change and users modules: the texts of the `account.wrong-password`, `account.no-password` and `users.*`
    errors, `users.invitation-not-sent` among them.
-   Preferences service: `BeyPreferencesService` and `provideBeyPreferences` start the app in the remembered, the
    browser or the default language, apply the language and theme saved on the account when a session opens, and
    save what a signed-in user picks.
-   App service: `preferences` on `BeyAppConfig`.
-   Session service: `language` and `theme` on `BeySessionUser`, read from the token.
-   Form module: `BeyFormCheckboxGroupField`, one checkbox per option, valued with the checked ones.
-   Form module: `autocomplete` on the base field parameters, the autofill hint of a text or password field.
-   Form module: `hint` on the base field parameters, a text under any field, info and list included, that describes it
    through `aria-describedby`; an error message replaces it while it shows.
-   Form module: `footer` on `BeyFormConfig` and `BeyModalFormConfig`, a `BeyFormFooter` with a divider over the buttons
    (`isDivided`) and a `note` at the start of their row that describes the submit button.
-   Testing: `beyAccessibleDescription(element)`, the text of what an element is described by, such as a field's hint.
-   Page module: `textField` on `BeyPageTableSearchConfig` sends that field as the `text` of the search.
-   Page module: `beyPageOwnerColumn(overrides?)` and `beyPageOwnerCell(row)` show the `ownerName` of a
    `BeyPageOwnedItem` under "Owner", sortable by `ownerId`; `BeyPageOwner` is exported.
-   Page module: `isOwnerFilterEnabled` on `BeyPageTableSearchConfig` adds an "Owner" filter, `ownerId` `equals`, from
    `GET {baseUrl}/owners` asked the first time the filters panel opens, shown only with two owners or more.
-   Search module: `label` and `operators` on `BeySearchField`, a full key for its label and the operators of its type
    it keeps, and `onPanelOpen` on `BeySearchConfig`, run every time the filters panel opens.
-   Table module: `label` on `BeyTableColumn`, a full key for its header and its entry in the columns menu.
-   Password policy service: `BeyPasswordPolicyService` reads `accessControlUrl/password-policy` the first time its
    `policy` signal is read, once for the app; until it answers, or if it fails, it holds the `BeyPasswordPolicy` defaults.
-   Form module: `policy` on `BeyFormPasswordField`, a `BeyPasswordPolicy` or a signal of one, lists its rules under the
    field in place of the hint, marks each one met as the user types and validates the password against it.
-   Login and password change modules: the new password of the reset-password and accept-invitation pages, of the
    registration and of `bey-password-change` follows the server's policy; texts of the `password.*` errors and titles.

### Changed

-   Session service (breaking, released in a minor on purpose): no token nor user is written to storage any more;
    the access token lives in memory and the refresh token in an httpOnly cookie the server owns.
-   Session service (breaking): `BeySessionConfig` keeps only `loginRoute`; `tokenKey`, `refreshTokenKey`, `userKey`,
    `getRefreshToken()` and `setRefreshToken()` are gone, and the old `bey_*` keys are removed from storage.
-   Session service (breaking): an app logs out with `logout()`; `clear()` forgets the session in the page only.
-   Session service: the interceptor refreshes through the cookie on a `401`, and never on one from the sign-in, the
    registration, the refresh or the logout.
-   Login module (breaking): `BeyLoginResponse` is `{ accessToken }`; sign-in and registration are sent with the
    credentials, and the OAuth callback restores the session through the cookie instead of reading tokens in the URL.
-   Login module: each view focuses its first field, and the sign-in form carries the autofill hints `email` and
    `current-password`.
-   App service: `provideBeyApp` starts the app in its language; an app no longer sets it in its `AppComponent`.
-   Floating preferences module: lists the `languages` of the preferences, each named in itself, and saves a signed-in
    user's choice; it needs `provideBeyApp`, or `provideBeyTesting` in specs.
-   Password change module: the new password lists the rules of the password policy instead of
    `<prefix>.password.password.hint`, which is no longer read.
-   Page module: a column that brings its own `tooltip` keeps it; only the others read `<prefix>.table.tooltips.<key>`.
-   Page module: on rows with an `ownerId`, `move` shows only for a selection of one owner and its picker asks
    `/categories/tree?ownerId=` for that owner's folders; a drag drops only onto a folder of the same owner.

### Fixed

-   Page module: the filters panel opens above the sticky header of the table instead of under it, since the search
    sits in the dropdown layer.
-   Pdf viewer module: pdf.js starts under a Content Security Policy sent as a header; the viewer checks the browser
    with `op-chaining-support.js` instead of an inline script the policy refused, which left it waiting forever.
-   App layout module: a navigation that ends while the layout is being created no longer reads its config before
    the input arrives (NG0950); the start of the layout activates the route instead.

## [1.3.0] - 2026-10-09

### Added

-   App layout module: `BeyAppLayoutBottomAction` takes an optional `route`.
-   App layout module: `isRouteBreadcrumbEnabled` on `BeyAppLayoutConfig` (`true` by default); `false` leaves the
    breadcrumb to the consumer, while the menu still follows the route and `onRouteActivated` still runs.
-   App layout module: `BeyAppLayoutConfig` keeps `iconSrc`, `productName`, `orgName`, `privacyUrl` and `termsUrl` as
    fields next to `footerConfig`, so a config spread into a new one is a full copy.
-   App layout module: `BeyAppLayoutConfigParameters`, `BeyAppLayoutTopActionParameters`,
    `BeyAppLayoutBottomActionParameters` and `BeyAppLayoutBreadcrumbItemParameters` are exported.
-   Breadcrumb module: `detail` and `detailParameters` on `BeyBreadcrumbItem` show a translated text after the label,
    never truncated, such as a count.
-   File preview module: `BeyFilePreviewService.open(config)` shows a PDF or an image from a `Blob` or a URL in a
    dialog, driven by `BeyFilePreviewConfig` and `BeyFilePreviewType`, and releases the object URL it creates.
-   File preview module: the dialog is laid out like a modal form, with an icon of the file type, the title and the file
    name; a PDF gets the compact toolbar with download and search, an image shrinks to fit.
-   Form module: `label` on `BeyFormSection` and on every field overrides the title or the label read from the prefix,
    for a form built from data, such as one field per variable of a document.
-   Form module: a rule can be a signal, and a custom validator runs again when a signal it reads or the form value
    changes, so data that arrives after the config is built reaches options and validators.
-   Form module: `BeyModalFormConfig` keeps `cancelLabel` and `submitLabel`, so a config spread into a new one is a full
    copy.
-   Form module: `BeyModalFormService.openWithRequest(config, submit)` opens a modal form whose submit sends a request
    and closes once it answers, for any screen.
-   Form module: a validator error shaped as `BeyFormFieldError` (`{ messageKey, messageParameters? }`) is shown
    translated under its field once touched, sync or async; the file field drops its size hint meanwhile.
-   Form module: `isFreeTextAllowed` on `BeyFormAutocompleteField` takes the typed text as the value and keeps the
    options as suggestions, so a value outside them stays.
-   Form module: `BeyFormListField` shows read-only texts as a list, from an array or a signal, with its placeholder
    while empty; it grows with its texts and leaves the scroll to the form.
-   Left menu module: a branch with its own `action` gets a submenu toggle over its chevron, reachable from the keyboard
    and named with `angular-components.left-menu.submenu`.
-   Modal module: `beyUnsavedChangesGuard` and `BeyUnsavedChangesService.track(hasChanges, config?)` ask before leaving
    a route with unsaved changes and warn on `beforeunload`; `BeyUnsavedChangesConfig` overrides the default texts.
-   Page module: `usagesConfig` (`BeyPageUsagesConfig`) warns before `delete` and `delete-trash-item` about the rows
    that use the selection, with `<prefix>.modal.<key>-in-use.*`.
-   Page module: `BeyPageUsagesService` names the users of a row for a cell (`describeRowUsers`) or a form
    (`listUsers`).
-   Page module: `BeyPageConfig` and `BeyPageConfigParameters` take the form value type, so a typed
    `BeyPageFormConfig<T>` fits without `<unknown>`.
-   Page module: `BeyPageConfig<TValue, TItem, TCategory>` types its rows, so `loadRow`, `onSelectionChange`, the action
    handlers, `buildSections`, `toFormValue`, `afterCreate`, `onDataLoaded` and `BeyPageHandle` need no casts.
-   Page module: `BeyPageCategoriesConfig<TCategory, TCategoryValue>` types the categories form value (`unknown` by
    default), carried as `TCategoryValue` through `BeyPageTableConfig` and `BeyPageConfig`.
-   Page module: `BeyPageActionScope.Single`, shown while exactly one selected row lists the key; its handler receives
    that row.
-   Page module: `loadRow(category, viewMode)` on `BeyPageCategoriesConfig` draws the category rows; without it a
    category row shows its name as a link that opens it.
-   Page module: `duplicate` standard action: a modal form for the name of the copy, sent to
    `POST {baseUrl}/{id}/duplicate` with its toast and a reload; `BeyPageDuplicationConfig` says which field names it.
-   Page module: `change-status` standard action: a modal form for one of the statuses the current one reaches
    (`BeyPageStatusConfig`), sent to `POST {baseUrl}/{id}/status` with its success toast and a reload.
-   Page module: `copySeparator` and `nameValidators` on `BeyPageDuplicationConfig` join the copy suffix to the name and
    check the name of the copy, for names that allow no space (`client_copy`).
-   Page module: `empty-trash` standard action, shown in the trash while the backend lists it, asks with
    `<prefix>.modal.empty-trash` and sends `DELETE {baseUrl}/trash/all`.
-   Page module: after a restore, an info toast lists the rows the backend renamed because another row already had their
    name (`renamed` in the answer of `PUT {baseUrl}/trash`).
-   Page module: `beyPageStandardAction(key, overrides?)` builds a standard action with its scope, zone, type and icon,
    and `beyPageAddAction(overrides?)` the `add-group` button holding `create` and `create-category`.
-   Page module: `confirmation(items, confirmation)` on a `delete`, `delete-category` or `delete-trash-item` action
    returns the confirmation to ask with, or an observable of it, keeping the standard request, toast and reload.
-   Page module: `confirmSave(value, item?)` on `BeyPageFormConfig` answers a confirmation the page asks over the form
    before a create or an edit is sent, typed as `BeyPageSaveConfirmation`.
-   Page module: `size` on `BeyPageFormConfig` opens its create and edit forms in that `BeyModalFormSize` (`Large` by
    default).
-   Page module: `openEdit(row)` on `BeyPageHandle` opens the edit form of a row, or the categories form of a category,
    as the `edit` action does, so a cell can open it.
-   Page module: `openForm(config, submit)` on `BeyPageHandle` opens a modal form for a custom action, sends
    `submit(value)` on save, and closes and reloads the page once the request answers.
-   Page module: `views` on `BeyPageConfig` adds a tab per `BeyPageView` between the main tab and the trash, listing the
    same rows with the `filters` of the view before those of the user.
-   Page module: a page left for a route under its URL comes back with its folder, tab, search, header sort, page, page
    size and selection; going anywhere else starts it fresh.
-   Page module: the last node of the breadcrumb counts the rows of the folder or of the trash,
    `angular-components.page.count.one` or `.many` with `{{count}}`.
-   Page module: in the trash, the first cell of a row that carries `parentPathField` (`parentPath` by default, on
    `BeyPageCategoriesConfig`) shows as its tooltip the folder a restore puts it back in.
-   Page module: a sortable column sorts the list through the `sort` of the search, from the first page, and clearing it
    goes back to `order`; such a page always sends the `search` parameter.
-   Page module: `storageKey` on `BeyPageTableConfig` gives the table its columns menu.
-   Page module: with the standard `move` action, the rows that list it can be dragged onto a category row, moved with
    the request, the toast and the reload of the action.
-   Pdf viewer module: `toolbar: BeyPdfViewerToolbar.Compact` shows a compact toolbar with zoom within
    `minZoom`–`maxZoom` by the new `zoomStep`, the current page, and a `bey-pdf-viewer-status` slot.
-   Pdf viewer module: `isSearchable` adds a search button to the compact toolbar, and `Ctrl+F`, opening a box over the
    document with the match count and the previous and next match, painted with the new `--bey-highlight` tokens.
-   Pdf viewer module: `isDownloadable` adds a download button at the end of the compact toolbar, saving the document as
    `filenameForDownload`.
-   Properties menu module: `withDisabled(disabled?)` on every field returns a disabled copy, as `withValue` does with a
    value, to show a menu read-only.
-   Properties menu module: tree rows expand with `ArrowRight` and collapse with `ArrowLeft`.
-   Properties menu module: the chevron of a tree row is a button named `angular-components.properties-menu.tree.expand`
    or `.collapse`, and a row, now a `treeitem` that holds it, is selected with `Enter` or `Space` as well as a click.
-   Properties menu module: `labelParameters` on `BeyPropertyTab`, `BeyPropertyGroup`, `BeyPropertyGroupTab` and
    `BeyPropertyTreeNode`, passed to the translate pipe with the label key.
-   Search module: `filters` on `BeySearchConfig`, the filters the box and the panel start from.
-   Services: `provideBeyApp` registers the HTTP client with the session interceptor, the environment, the session, the
    modal, the toast and the translations loader in one provider, typed by `BeyAppConfig`.
-   Services: `provideBeyHttp()`, included in `provideBeyApp` and `provideBeyTesting`, keeps rxjs from reporting an HTTP
    error the service already showed.
-   Services: the HTTP error modal explains `action-unavailable` and `invalid-transition`.
-   Services: the HTTP error modal explains the `attachments.*` errors: `content-already-set`, `content-not-set`,
    `content-too-large`, `duplicate-content`, `empty-content`, `replace-type-mismatch` and `unsupported-type`.
-   Style guide: `bey-style-guide` loads its own translations from `assets/angular-components/i18n-style-guide/` for the
    current language and every language change.
-   Table module: `BeyDateTableCell` (`BeyCellType.Date`), formatted in the `LOCALE_ID` locale, `mediumDate` unless
    `format` says otherwise.
-   Table module: `BeyTagsTableCell` (`BeyCellType.Tags`), plain strings as untranslated outline badges.
-   Table module: a row with fewer cells than columns is completed with empty cells.
-   Table module: `icon` on `BeyTextTableCell` and `BeyLinkTableCell`, a FontAwesome icon drawn before the content and
    hidden from screen readers; on a link it is part of the link.
-   Table module: `BeyTableColumnParameters`, `BeyTableConfigParameters` and the `Bey*TableCellParameters` types are
    exported.
-   Table module: `isSortable` and `sortField` on `BeyTableColumn` turn its header into a button named by its text that
    goes from no sort to ascending and descending, with an arrow and `aria-sort`.
-   Table module: `sort` and `onSortChange` on `BeyTableConfig` set and report the header sort as a `BeyTableSort` with
    a `BeyTableSortDirection`.
-   Table module: `storageKey` on `BeyTableConfig` offers a columns menu to hide and show the columns that are
    `isHideable`, starting from `isVisible` (both `true` by default), and remembers the choice in `localStorage`.
-   Table module: `width` on `BeyTableColumn` also takes a CSS track (`8rem`), and the shares of the other columns
    spread over the ones shown.
-   Table module: `isRowDraggable`, `isDropAllowed` and `onRowDrop` on `BeyTableConfig` let a row, or the selection it
    belongs to, be dragged onto another row with the native drag and drop.
-   Table and form modules: `tooltipItems` on every table cell and on the items of `BeyFormInfoField` shows the tooltip
    as a list, with the `tooltip` as its title.
-   Tabs module: `labelParameters` on `BeyTab`, passed to the translate pipe with the label key in the tab bar and in
    the overflow menu.
-   Testing: secondary entry point `@beyonda-labs/angular-components/testing` for the specs of a consuming app.
-   Testing: `provideBeyTesting(config?)`, typed by `BeyTestingConfig`, registers the HTTP client backed by
    `HttpTestingController`, a test environment and the ngx-bootstrap modals.
-   Testing: `provideBeyTesting` starts the session over in-memory storage, signed in with `user`, and ngx-translate
    without a loader or with `translations` per language.
-   Testing: `provideBeyTesting` puts `BeyFakeModalService`, `BeyFakeToastService`, `BeyFakeModalFormService`,
    `BeyFakeFilePreviewService` and `BeyFakeStorageService` in place of the real services.
-   Testing: the fakes record what they are asked for in signals, `setConfirmationAnswer` sets what a confirmation
    emits, and `BeyFakeModalFormService` offers `openWithRequest` too.
-   Testing: DOM helpers `beyRenderComponent`, `beySettle`, `beyButtonByName`, `beyQueryButton`, `beyQueryAll`,
    `beyTextsOf` and `beyHostOf`.
-   Testing: `beyControlByName`, `beyQueryControl` and `beyAccessibleName` find a form control by the name a user hears:
    its `aria-labelledby`, its `aria-label` or its `<label>`.
-   Utilities: `beyFormatBytes` formats a size in bytes as the file field shows it (`1.5 KB`).
-   Utilities: `beyToKeySegment` turns an identifier into the kebab-case segment the library builds its translation keys
    from.

### Changed

-   `BeyCellType`, `BeyLoadingSize`, `BeyModalFormSize` and `BeyModalTreeSize` list their members alphabetically, so
    `Object.values` returns them in that order.
-   App layout module: the menu and breadcrumb keys derived from action keys are kebab-case (`monthlyReports` reads
    `actions.monthly-reports.label`); translation files with camelCase segments must be renamed.
-   App layout module: an action with a `route` navigates to it when used from the menu; an action with its own `action`
    runs it instead, and its `route` only marks it active.
-   App layout module: `icon` is optional on `BeyAppLayoutTopAction` and `BeyAppLayoutBottomAction`.
-   Badge module: `translate` → `isTranslated` on `BeyBadgeConfig` and `BeyBadgeConfigParameters`.
-   Form module: the key segments derived from section and field identifiers are kebab-case (`valueString` reads
    `value-string.label`); translation files with camelCase segments must be renamed.
-   Form module: `isRequired` is a `BeyFormRule<boolean>` instead of a `boolean`, a rule like `isHidden` and
    `isDisabled`; the required validator, the marker and `aria-required` follow it as the form value changes.
-   Form module: the number, checkbox, chips and file fields type `validators` as `BeyFormFieldCustomValidator[]`, so a
    length, pattern, email or url validator on them no longer compiles.
-   Form module: a select, radio or autocomplete clears its value when its options change and no longer list it.
-   Form module: a select field shows its placeholder muted, as the inputs do, until an option is chosen, and so does
    its placeholder option in the list; picking that option empties the field.
-   Header module: `badges`, a list, replaces `badge`, so a title can carry several, such as a status and a read-only
    mark.
-   Header module: the default keys derived from action keys are kebab-case (`saveDraft` reads
    `actions.save-draft.label`); translation files with camelCase segments must be renamed.
-   Left menu module: the default keys derived from action keys are kebab-case (`userSettings` reads
    `actions.user-settings.label`); translation files with camelCase segments must be renamed.
-   Page module: `isTrashEnabled` on `BeyPageTableConfig` replaces `useTrash` on `BeyPageCategoriesConfig`, so a page
    without categories gets the trash view too.
-   Page module: the keys derived from action, column and search field keys are kebab-case (`createdAt` reads
    `table.tooltips.created-at`); translation files with camelCase segments must be renamed.
-   Page module: an action `handler` always receives an array, `[]` for `Global` and `Group` instead of `undefined`.
-   Page module: on a page with categories, an action `handler` receives only the selected rows that are not categories,
    and the action is hidden while only categories are selected.
-   Page module: rows whose `typeField` says `category` no longer go through the table's `loadRow` but through
    `categoriesConfig.loadRow`, or the default name link.
-   Pdf viewer module: `showToolbar` → `toolbar`, a `BeyPdfViewerToolbar` (`None` by default, `Full` for the toolbar of
    pdf.js).
-   Pdf viewer module: without the toolbar of pdf.js (`None`, `Compact`) the viewer turns off its keyboard shortcuts,
    its context menu and opening a dropped file, so no half-built find bar or menu shows up.
-   Properties menu module: the default keys derived from tab, group, field, tree and list ids are kebab-case
    (`fontFamily` reads `fields.font-family.label`); translation files with camelCase segments must be renamed.
-   Properties menu module: the action button tooltip of a field is `fields.<id>.action-button.tooltip` instead of
    `fields.<id>.actionButton.tooltip`.
-   Properties menu module: a new config keeps what the user expanded, the open tabs and the selected tree node, matched
    by id, unless the config changes that value; a node the config selects opens its ancestors.
-   Search module: the label keys derived from field keys are kebab-case (`createdBy` reads `fields.created-by`);
    translation files with camelCase segments must be renamed.
-   Search module: a new `BeySearchConfig` starts the box and the panel again from its `filters` instead of keeping what
    the user had typed.
-   Search module: `BeySearchField.getOperators()` → `beySearchFieldOperators(field)`, a function, so `BeySearchField`
    only holds data.
-   Services: `BeyHttpService` reads the reason of an error from `messageKey` in the body instead of `message`, as
    express-components now sends it.
-   Services: `BeyHttpService` returns a cold, typed observable: the request leaves on subscribe, each subscription
    sends its own request and unsubscribing cancels it.
-   Services: after the error modal (or `handleError`) the `HttpErrorResponse` of a `BeyHttpService` request reaches the
    subscriber instead of completing empty.
-   Style guide: the list and tree demos show the selected item on the page instead of logging it, and the tree demo
    highlights the node the user picks.
-   Table module: the header keys derived from column keys are kebab-case (`createdAt` reads `columns.created-at`);
    translation files with camelCase segments must be renamed.
-   Tabs module: the default keys derived from tab keys are kebab-case (`billingDetails` reads
    `tabs.billing-details.label`); translation files with camelCase segments must be renamed.
-   Tree module: the default label keys derived from node keys are kebab-case (`sharedFolder` reads
    `nodes.shared-folder.label`); translation files with camelCase segments must be renamed.
-   Tree module: `BeyModalTreeConfig` is plain data: `title` always holds a value (`<prefix>.title` by default), and the
    dialog closes through the `BsModalRef` that `BeyModalTreeService.open` returns.

### Fixed

-   App layout module: a navigation that a guard cancels, or that fails, no longer leaves the menu and the breadcrumb on
    the page that was not reached.
-   Form module: the options of an autocomplete field keep their background, border and hover inside a modal: the panel
    moves to the body and lost the variables its host declared.
-   Form module: `stretch` buttons share the full width in a row, and the sections no longer show a horizontal scroll.
-   Form module: a custom validator that reads a signal no longer rebuilds the form, and loses what was typed, when that
    signal changes.
-   Form module: the autocomplete, chips, file and password fields apply their `validators`, which were silently
    ignored; the file field runs them together with `accept` and `maxSizeBytes`.
-   Form module: the chips field shows its invalid state once its input is left.
-   Header module: icon-only actions are named by the label key a text action would show, and the overflow toggle by
    `angular-components.header.menu`, so screen readers announce them.
-   Loading module: the full-screen overlay sits over the dialogs (`--bey-z-loading`), so a request sent from a modal
    form shows its loading instead of leaving the form still.
-   Login module: the provider buttons are named after their provider (`angular-components.login.provider.<id>`).
-   Page module: a new load of the list cancels the one still out, so a slow response no longer overwrites the rows of a
    newer page, search or category.
-   Page module: `edit-category` is offered only with exactly one row selected, as `edit` already was.
-   Page module: `move` recognises the selected categories through `typeField` instead of a hard-coded `type`.
-   Pagination module: the page size select and the page input are named by their translated labels instead of fixed
    English `aria-label`s.
-   Properties menu module: every field control is named by its translated label, through a `<label for>` tied to a
    unique id or an `aria-label` where no label shows, instead of the raw key.
-   Properties menu module: the extra controls of a field (hex value, array entries and their remove buttons, the file
    button) get their own names, and the attachment upload is reachable from the keyboard.
-   Services: a failed `getBlob` shows the reason the server gives, read from its `Blob` body, instead of the unknown
    error.
-   Style guide: the login example scrolls with the library's thin scrollbar.
-   Styles: `--bey-success`, `--bey-danger`, `--bey-warning` and the Bootstrap bridge (`--bs-*`, the datepicker colours)
    follow the dark theme; declared only on `:root`, they kept the light colours, and the body text stayed dark.
-   Styles: every `bey-button` type and the Bootstrap radius utilities follow the `--bey-radius-*` tokens; the primary,
    secondary, tertiary and link-secondary buttons ignored `--bey-radius-sm`.
-   Table module: a link cell only answers a click on its text and its icon; the empty space of the cell selects the row
    like any other cell.
-   Table module: the rows are drawn again when the language changes, keeping the selection, so texts a `loadRow`
    translates itself no longer stay in the previous language.
-   Tabs module: tabs whose labels widen after the first paint (translations that load late, a language switch, a web
    font) move into the overflow menu instead of spilling out of a narrow bar.
-   Tree module: picking a node in the tree dialog no longer reopens the branches the user collapsed.

### Removed

-   Services: `onSuccess` and `onError` on `BeyHttpRequestOptions`; subscribe to the request instead.
-   Tree module: `close`, `confirm`, `getSelectedNode`, `getTitle`, `hasSelection` and `closeHandler` on
    `BeyModalTreeConfig`.

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
