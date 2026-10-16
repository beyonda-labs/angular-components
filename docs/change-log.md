# Change Log

## [Unreleased]

### Added

-   App layout module: `notifications` on `BeyAppLayoutConfig` turns the notifications centre on, as a bell at the foot
    of the menu.
-   Audit page: `bey-audit` (`BeyAuditComponent`, `BeyAuditConfig`), the read-only audit trail over `/audit` on
    `bey-page`: who did what, when and from where, newest first, searched by user, row name or IP.
-   Audit page: filters by date range, by user (typed, over `{baseUrl}/user-options`), by entity and by action, and for
    the superadmin by organization, with an organization column only while the list spans several organizations.
-   Audit page: "Export", while the server lists `export` in `globalActions`, saves the CSV of the search and the
    filters in force, `GET {baseUrl}/export` through the HTTP service, as `audit-<yyyymmdd>.csv`.
-   Audit page: the row name and "View" open every field of an event read-only, from `GET {baseUrl}/{id}`, its details
    as "key: value" lines.
-   Audit page: the labels of the library's entities and of every verb the audit records, `transfer` and `scan-refused`
    included; `entityLabels` and `actionLabels` label those of the app, and an unlabelled one shows its raw name.
-   Audit page: `BeyAuditEventRow`, the row the server answers, and `BEY_AUDIT_READ_PERMISSION`, `audit.read`.
-   Breadcrumb module: `BeyBreadcrumbText`, a `detailParameters` value translated with its own parameters before the
    detail, so a detail joins texts with plurals of their own.
-   Form module: `isTypeahead` on `BeyFormAutocompleteField`, a text input with no toggle that suggests only once
    something is typed, so `search` is never asked for `''`; without free text, only a picked option is its value.
-   Form module: `excludedValues` on `BeyFormListField`, ids its picker never suggests besides those the list holds,
    a value or a rule, so two lists can keep each other's ids out.
-   Header module: `--bey-header-title-max-width`, `31.25rem`, the width the title stops at.
-   HTTP service: the texts and titles of `database.busy`, the 503 express-components answers when MySQL meets a
    conflict between two operations.
-   HTTP service: the texts and titles of `attachments.invalid-type` (with `{{allowed}}`), `attachments.infected` (with
    `{{signature}}`) and `attachments.scan-unavailable`.
-   Left menu module: `notifications` on `BeyLeftMenuConfig`, the bell at the foot of the menu, next to the user or
    alone.
-   Notifications module: `bey-notifications` (`BeyNotificationsComponent`, `BeyNotificationsConfig`), the bell of the
    notifications centre with the unread count as a badge, which opens a panel with the notices, newest first.
-   Notifications module: opening a notice marks it read and follows the route `link` gives; the panel refreshes at
    once, marks all as read, shows more while `hasMore`, and says when there is nothing.
-   Notifications module: `BeyNotificationsService` asks `GET {baseUrl}/unread-count` every `pollIntervalMs` (60 s) and
    after a navigation while a session is open, with no error modal, and stops on sign-out.
-   Notifications module: `BeyNotification`, `BeyNotificationTarget`, `BeyNotificationsPage`, `BeyNotificationType` and
    the texts of its four types; `labels` and `entityLabels` label the types and entities of the app.
-   Notifications module: `BeyNotificationType.RowsTransferred` (`entities.rows-transferred`), a sentence for the new
    owner of rows, such as "Grace gave you the template “Contract”" or "… 3 templates", from its `kind` and `count`.
-   Notifications module: `entityNouns` on `BeyNotificationsConfig`, `entity → BeyNotificationNoun` `{ one, other }`,
    the keys that name one row of an entity with its article and several without one.
-   Page module: `search()` on `BeyPageHandle`, the search the list in view was asked with, as the page sends it.
-   Page module: `beyPageDateRangeFields(fromKey?, toKey?)`, a "From" and a "To" date filter, `from` and `to` by
    default.
-   Page module: links, `?view=` (`table`, `shared`, `trash` or a view key) and `?folder=` open that tab and folder in
    place of the kept state, then leave the URL with `replaceUrl`; an unknown view or folder falls back quietly.
-   Page module: a folder whose row carries `isShared`, and every folder of the shared view, shows the shared folder
    icon, named "Shared folder"; `sharedIcon` on `BeyPageCategoriesConfig` changes it.
-   Page module: `BeyPageCategoryIcon` `{ icon, label }` and `BEY_PAGE_SHARED_CATEGORY_ICON`, the shape and the default
    of `sharedIcon`.
-   Page module: `countLabels` and `itemCountLabels` on `BeyPageCategoriesConfig` (`BeyPageCountLabels`), the keys the
    count names folders and items with; `BEY_PAGE_CATEGORY_COUNT_LABELS` and `BEY_PAGE_ITEM_COUNT_LABELS`.
-   Page module: `baseUrl` on `BeyPageView`, a flat view listed, searched and counted at its own URL, with no folders,
    drag nor folder actions; its row actions still go to the page's `baseUrl`, and leaving it gives the folder back.
-   Page module: `BeyPageStandardAction.Transfer`, "Change owner", while every selected row lists it: a typeahead over
    `GET {baseUrl}/transfer-targets` picks a user of their organization, and `POST {baseUrl}/transfer` hands them over.
-   Page module: `transferConfig` on `BeyPageConfig` (`BeyPageTransferConfig` and its `notice`), the answers
    `BeyPageTransferTarget`, `BeyPageTransferTargets` and `BeyPageTransferResponse`, and the texts of its refusals.
-   Roles page: the label and the description of `audit.read`, in an "Audit" section with its own icon.
-   Search module: `BeySearchFieldType.Date`, a day or a range of days sent as epoch milliseconds, each bound including
    its whole day in the time zone of the browser.
-   Search module: `BeySearchFieldType.Autocomplete` and `searchOptions` on `BeySearchField`, the options asked for the
    typed text, `BeySearchFieldOptionsResult` `{ options, hasMore? }`; the value of the option picked is the filter.
-   Table module: `iconLabel` on `BeyTextTableCell` and `BeyLinkTableCell`, the name of the icon for screen readers and
    its tooltip.
-   Testing entry point: `beyRowWith` and `beyCellsOf`, a table row by its text and the texts of its cells;
    `beyFieldsOf` (`BeyFormFieldsSource`), the fields of a form config or of its sections, all or one section's.
-   Testing entry point: `beyDecodePageSearch` and `beySearchOf` (`BeySearchRequest`), the `BeyPageSearch` a page sends,
    and `beyTreeDialogItems` and `beyPickInTreeDialog`, which drive the tree dialog `provideBeyTesting` opens.
-   Testing entry point: `BeyFakeFormHandle` (`BeyFakeFormHandleParameters`), a Jest-free `BeyFormHandle` for the
    callbacks of a recorded form, which answers its `value` and records its closes, resets, patches and steps.
-   Tokens: `--bey-dialog-icon-size`, the icon box of the modal and tree dialogs.
-   Users, groups and roles pages: the count of the superadmin folders names organizations and users, groups or roles,
    from `count.categories.*` and `count.items.*` under their `prefix`.
-   Utilities: `BEY_SHARED_FOLDER_ICON`, a one-colour FontAwesome `IconDefinition` of a folder with a person cut out of
    it, which `fa-icon` draws wherever an icon is accepted, such as a tree.
-   Style guide: `beyAdministrationStyleGuideInterceptor` and `beyPageStyleGuideInterceptor`, which answer the
    `/style-guide/` requests of the administration and sharing demos from fixed data; the app registers them.
-   Style guide: demos of the roles `groupIcons`, `groupOrder` and `actionOrder`, of page sharing and change of owner,
    of the form notice, typeahead and `isSubmitDanger`, and of an edit lock held by nobody known or lost.

### Changed

-   App layout module (breaking): the content area between the breadcrumb bar and the footer scrolls inside, both ways,
    in place of the whole body, so the footer stays at the bottom; a child that fills the area takes `height: 100%`.
-   App layout module (breaking): `useBodyPadding` of `BeyAppLayoutConfig` is `hasBodyPadding`, and `active` and
    `disabled` of the app-layout actions are `isActive` and `isDisabled`.
-   Breadcrumb module (breaking): `translate` of `BeyBreadcrumbConfig` is `isTranslationKey`.
-   Cards module: the initials of `bey-avatar` and of the left menu drop their accents, "Ana Álvarez" reads "AA".
-   Edit-lock service: the text of `edit-locks.held` says that nothing was changed, so it reads for a delete or a change
    of owner as well as for a save.
-   Floating preferences module (breaking): the `usePill` input of `bey-floating-preferences` is `hasPill`.
-   Form module (breaking): `allowSubmitWithoutChanges` of `BeyFormConfig` and `BeyModalFormConfig` is
    `canSubmitWithoutChanges`.
-   Form module (breaking): `BeyFormChipsField.allowDuplicates` is `canAddDuplicates` and
    `BeyFormPasswordField.showToggle` is `isToggleShown`.
-   Form module (breaking): `--bey-modal-form-close-bg-hover` is `--bey-modal-form-close-hover-bg`.
-   Header module (breaking): `disabled` of `BeyHeaderAction` is `isDisabled`.
-   HTTP service (breaking): `loading` and `withCredentials` of `BeyHttpRequestOptions` are `isLoading` and
    `hasCredentials`; the latter still reaches `HttpClient` as its `withCredentials`.
-   Left menu module (breaking): `active` and `disabled` of `BeyLeftMenuAction` are `isActive` and `isDisabled`, and
    `expanded` of `BeyLeftMenuConfig` is `isExpanded`.
-   Left menu module (breaking): `BeyLeftMenuUserInfo.initials` holds only what the consumer gives; the avatar still
    shows the initials of the name and surname without it.
-   List module (breaking): `bare` of `BeyListConfig` is `isBare`.
-   Loading module (breaking): the `fullscreen` input of `bey-loading-overlay` is `isFullscreen`.
-   Login module (breaking): the register fields are read with `isRequired` and the registration answer with
    `isVerificationRequired`, as express-components 1.4.0 sends them.
-   Modal module (breaking): `closeOnBackdrop` of `BeyConfirmationModalConfig` and `BeyNotificationModalConfig` is
    `canCloseOnBackdrop`.
-   Modal module (breaking): the variant classes of the dialog are `bey-modal--<type>` (`bey-modal--confirmation`,
    `--error`, `--info`, `--warning`), in place of `bey-modal-<type>`.
-   Modal module: the icon reads `--bey-dialog-icon-size`, as the tree dialog does, and the dialog fills the width of
    its Bootstrap modal; the `32rem` cap never applied under its `500px`.
-   Page module (breaking): `BeyPageAction.handler` is `action`, in `BeyPageActionParameters` and in the overrides of
    `beyPageStandardAction`.
-   Page module (breaking): `allowSubmitWithoutChanges` of `BeyPageFormConfig` is `canSubmitWithoutChanges`, and
    `allowSelection` and `showPagination` of `BeyPageTableConfig` are `canSelect` and `isPaginationShown`.
-   Page module (breaking): `tableConfig.height` is optional with no default, `60vh` before: without it the page fills
    its container and the table takes the height left by the header, the toolbar and the pagination, scrolling inside.
-   Page module: the share form shows two lists, "Can view" and "Can edit", each with a search of users and groups
    above its removable rows, in place of a select per grantee; the inherited access comes under them.
-   Page module: the share search asks `share-targets?search=&limit=` as the user types, a group named with its
    `memberCount`, now on `BeyPageShareTarget`, and a user with their email; nobody is offered in both lists.
-   Page module: the count of the breadcrumb tells folders from items, "(2 folders · 4 items)", by the new
    `search.categoryTotal` of the answer, or "(4 items)" without folders; `count.one` and `.many` are gone.
-   Page module: a sort on a column the list no longer shows, left out by `isColumnShown` or hidden by the user, also
    one kept from an earlier visit, goes back to `order` once the list answers.
-   PDF viewer module (breaking): the thirteen flags of `BeyPdfViewerToolbarButtons` take `has`: `downloadButton` is
    `hasDownloadButton`, `zoomDropdown` is `hasZoomDropdown`, and so on.
-   Properties menu module (breaking): `disabled`, `expanded`, `hidden`, `removable` and `active` of the tabs, groups,
    list items, tree nodes, options and fields, and `expanded` of their toggle events, are `isDisabled` and so on.
-   Properties menu module (breaking): `required` and `acceptsVariable` of `BeyPropertyField` are `isRequired` and
    `canAcceptVariable`, and `readonly` of the color, number, spacing and text fields is `isReadonly`.
-   Properties menu module (breaking): `BeyPropertyTextField.multiline` is `isMultiline`,
    `BeyPropertySelectField.searchable` is `isSearchable` and `BeyPropertyGroup.showHeader` is `isHeaderShown`.
-   Properties menu module (breaking): `acceptsRootDrop` and `showEmptyStateAddBlock` of `BeyPropertyTreeConfig` are
    `canAcceptRootDrop` and `isEmptyStateAddBlockShown`, and `BeyPropertiesMenuConfig.embedded` is `isEmbedded`.
-   Properties menu module (breaking): `acceptsDrop`, `draggable` and `dropDisabled` of `BeyPropertyTreeNode` are
    `canAcceptDrop`, `isDraggable` and `isDropDisabled`.
-   Properties menu module (breaking): `withValue` and `withDisabled` of `BeyPropertyField` are the functions
    `beyPropertyFieldWithValue(field, value)` and `beyPropertyFieldWithDisabled(field, isDisabled?)`.
-   Properties menu module (breaking): `holdsVariable` and `selectedOption` of `BeyPropertyAttachmentField` and
    `holdsVariable` of `BeyPropertySelectField` are gone; they were the field's own logic.
-   Styles: an invalid `.form-control` or `.form-select` shows no Bootstrap validation icon and keeps its padding; the
    red border and the error message stay, and the autocomplete, chips and file fields lose their icon.
-   Table module (breaking): `selectable` and `selectedItemsChange` of `BeyTableConfig` are `isSelectable` and
    `onSelectionChange`, and `translate` of `BeyTableCell` and of every cell and its parameters is `isTranslationKey`.
-   Table module (breaking): `height` of `BeyTableConfig` has no default, `60vh` before: without it the table takes the
    height its flex container gives it, or grows with its rows.
-   Table module: hiding the column the table sorts by, from the columns menu or its reset, clears the sort and calls
    `onSortChange` with `null`.
-   Tree module (breaking): `--bey-close-hover-bg` of the tree dialog is `--bey-modal-tree-close-hover-bg`.
-   Users, groups, roles, organizations and audit pages (breaking): `height` and `foldersHeight` have no default, so
    the page fills; `foldersHeight` falls back to `height`.

### Fixed

-   Breadcrumb module: `itemMaxWidth` limits the label alone, so a detail such as the page counts no longer truncates
    it.
-   Form module: a radio option with `isDisabled` is disabled, through the form API as the other fields do.
-   Page module: at the root of "Shared with me", a shared folder offers neither `move` nor drag, so moving never opens
    the whole tree of its owner.
-   Session service (breaking for a nested guarded route): `beyAuthGuard` checks the whole matched path,
    `/parent/child`, not only the last segment.

### Removed

-   HTTP service: the texts of `attachments.unsupported-type`, which express-components answers as
    `attachments.invalid-type` now.

## [1.5.0] - 2026-10-13

### Added

-   Cards module: `bey-card`, `bey-card-stats`, `bey-card-list` and `bey-avatar`, the pieces of a summary page: a card
    with a title and a count, a strip of figures, lists of items that fold or open, and the initials of a person.
-   Cards module: `BeyCardStat`, `BeyCardListItem`, `BeyCardListFold`, `BeyCardListVariant` and `BeyAvatarVariant`,
    the entries and the variants those configs take.
-   Cards module: the `--bey-cards-*` variables, each declared on the public element of its piece; both variants of an
    avatar follow `--bey-cards-avatar-bg` and `-fg` set on it, on any ancestor or on `:root`.
-   Edit lock notice module: `bey-edit-lock-notice`, who edits the row and since when, with Release (confirmed), Edit
    here, Edit once free (`onEdit` reloads first) and Save as a copy (`onSaveCopy`), its texts under `prefix`.
-   Edit lock service: `BeyEditLockService`, provided by the component that edits a row: `start(lockUrl)` acquires the
    edit lock of base-entity for a token of the window, keeps it with a heartbeat and watches it while others hold it.
-   Edit lock service: `acquire()`, `takeOver()`, `release()`, `releaseOther()` and `headers()`, the `X-Edit-Lock-Token`
    of the save; the lock is released on destroy and on `pagehide`, through a `keepalive` fetch with the bearer.
-   Edit lock service: `BeyEditLock`, `BeyEditLockState` and `BeyEditLockStatus`; `holderName` is `null` for a holder
    the server no longer names, whom `bey-edit-lock-notice` calls "Unknown".
-   Edit lock service: the texts of the `edit-locks.held`, `edit-locks.released` and `edit-locks.release-forbidden`
    errors.
-   Form module: `BeyFormCheckboxSectionsField`, checkboxes in a card per `BeyFormCheckboxSection`, folded at first,
    with a counter and select all, a description under each option; its value lists every checked one.
-   Form module: `BeyFormNoticeField`, a `bey-notice` of a `BeyNoticeVariant` inside a form, with its message and its
    parameters and no control.
-   Form module: `BeyFormFieldType.CheckboxSections` and `BeyFormFieldType.Notice`, the types of those two fields, and
    `BeyFormCheckboxSectionOption`.
-   Form module: `filter`, `search` (`BeyFormAutocompleteSearch`, debounced, asked with the values left out),
    `onSelect`, `isClearedOnSelect` and `excludedValues` (a value or a rule) on `BeyFormAutocompleteField`.
-   Form module: `search` of `BeyFormAutocompleteField` may answer a `BeyFormAutocompleteSearchResult`,
    `{ options, hasMore? }`; with `hasMore` the suggestions end with "There are more matches: type more…".
-   Form module: a `BeyFormListField` with `options` or a `picker` (`BeyFormListPicker`) holds ids: a row per id with
    its label, a search above that adds rows, a remove button per row with `isRemovable`, and `emptyKey`.
-   Form module: a `BeyFormListField` that holds ids and has no `search` drops the ids its options no longer list once
    they change, as a select clears a value its options no longer list.
-   Form module: `onItemClick` on a `BeyFormListField` of texts makes every text a link and calls it with the text and
    its index.
-   Form module: `isSubmitHidden` on `BeyModalFormConfig` leaves only the cancel button, for a form that only shows.
-   Form module: `isSubmitDanger` on `BeyModalFormConfig` and `isDanger` on `BeyFormButton` paint a submit button in
    the danger colour.
-   Groups page: `bey-groups`, the groups of users of an organization over `/groups` on `bey-page`, for its managers and
    the superadmin: create and delete (confirmed) a group, and edit its name, members and extra roles in one form.
-   Groups page: `BeyGroupRow` and `BeyGroupMember`, the rows and the members the server answers; a "Roles" column
    shows the `extraRoleCount` of each group, the extra roles its members all get.
-   Groups page: the edit form reads `GET {baseUrl}/{id}`; its members and extra roles, always shown and always sent,
    are removable lists searched over `{id}/member-options` and `{id}/role-options` (`?search=&limit=`).
-   Groups page: those searches say there are more matches when the server answers as many as asked for, or more than
    20 are left once those chosen are left out.
-   Groups page: for a superadmin, an organization column, the organization in the create form (required, chosen
    already when only one is active) and disabled in the edit form, and with two active or more a filter by it.
-   Groups page: rows with no action but `view`, and no `create`, turn the page read-only, with no second request,
    "Roles" only with a `roleCount`, and the name opening the members and roles of a group, each role its permissions.
-   Groups page: "View" in the header opens the selected group read-only when its row lists `view`, as its name does.
-   Groups page: `rolesConfig` on `BeyGroupsConfig` (`BeyRoleViewSettings`, a `BeyRolesConfig` fits), the sections and
    order of the permissions of a role opened from a group.
-   Groups page: the texts of the `groups.existing-name`, `.invalid-members`, `.invalid-extra-roles` and `.not-found`
    errors.
-   HTTP service: the texts of the `entities.owner-required` error, a create with no user to own the row.
-   Login module: the texts of the `login.organization-inactive` error, a sign-in refused because the organization of
    the user is deactivated.
-   Modal, form, tree and file preview modules: `--bey-modal-max-height`, `--bey-modal-form-max-height`,
    `--bey-modal-tree-max-height` and `--bey-file-preview-max-height`, on `:root`, `--bey-dialog-max-height` by default.
-   Notice module: `bey-notice`, a compact banner across its container: a `BeyNoticeVariant` (`Info`, `Warning`,
    `Danger`, announced as an alert), an icon, a translated message with its parameters, and its `BeyNoticeAction`s.
-   Notice module: `BeyNoticeActionType`, `Primary` or `Secondary`, the look of an action of the banner.
-   Organization summary page: `bey-organization-summary`, the organization of a member read-only from
    `GET {organizationsUrl}/current` in one card under its page title: name, creation, figures and administrators.
-   Organization summary page: the members by status when answered, every group with its members folded, "No group"
    last, and every extra role, opening the `permissions` answered with it in the view of `rolesConfig`.
-   Organization summary page: `BeyOrganizationSummary`, the answer, with its `…Administrator`, `…Counts`,
    `…StatusCounts`, `…Group`, `…Member` and `…ExtraRole`.
-   Organizations page: `bey-organizations`, the superadmin's page over `/organizations` on `bey-page`: create an
    organization, and edit its name and status in one form showing its administrators, groups and "No group".
-   Organizations page: `BeyOrganizationRow` and `BeyOrganizationStatus`, the rows the server answers, searched by name
    and filtered by status.
-   Organizations page: `delete`, on a deactivated organization that lists it, confirms with what it holds and its
    exact name typed, then sends `DELETE {baseUrl}/{id}` `{ name }`; `contentLabels` on `BeyOrganizationsConfig`.
-   Organizations page: the texts of the `organizations.existing-name`, `.not-found`, `.active` and `.name-mismatch`
    errors.
-   Page module: `beyPageOrganizationColumn(overrides?)` and `beyPageOrganizationCell(row)` show the `organizationName`
    of a `BeyPageOrganizationItem`, only while `GET {baseUrl}/organizations` names two organizations or more.
-   Page module: `isOrganizationFilterEnabled` on `BeyPageTableSearchConfig` adds an "Organization" filter,
    `organizationId` `equals`, from the same answer (`BeyPageOrganization`), shown only with two organizations or more.
-   Page module: `isSharedEnabled` on `BeyPageTableConfig` adds a "Shared with me" tab, `BeyPageViewMode.Shared`, that
    lists `GET {baseUrl}/shared` and opens its folders as usual, its breadcrumb starting at the shared folder.
-   Page module: inside a shared folder rows drag onto its folders, and `move` picks only among it and those below.
-   Page module: `BeyPageStandardAction.Share` on a folder sets no access, view or edit per group and user of
    `/categories/{id}/share-targets`, above what the folder inherits, with `PUT /categories/{id}/shares`.
-   Page module: the texts of the `sharing.invalid-grantees` error, and `BeyPageShare`, `BeyPageInheritedShare`,
    `BeyPageShareTarget`, `BeyPageShareAccess` and `BeyPageShareGranteeType` for the answers of the share routes.
-   Page module: `BeyPageStandardAction.View`, one row, next to `edit`, labelled "View" by the page module
    (`angular-components.page.actions.view.*`); it has no behaviour of its own, so it takes a `handler`.
-   Page module: `toItem` of `BeyPageFormConfig` receives the row an edit started from as its second argument.
-   Page module: `buildSections` and `toFormValue` of `BeyPageFormConfig` receive the category open in the page, a
    `BeyPageCategoryPathEntry` `{ id, label }`, or `undefined` at the root, so a create form can preselect from it.
-   Page module: `isColumnShown(column, context)` on `BeyPageTableConfig` leaves a column and its cells out by the
    `BeyPageColumnContext` of the list in view, `{ category?, isSearching }`, asked again once each list answers.
-   Properties menu module: `isUploadEnabled` on `BeyPropertyAttachmentField`, `true` by default; with `false` the
    field shows no upload button and its existing attachments stay selectable.
-   Roles page: `bey-roles`, the roles and permissions page over `/roles` on `bey-page`: the base roles read-only and
    the extra roles of the organization, created, edited and deleted (confirmed) with a checklist of permissions.
-   Roles page: `BeyRoleRow`, the rows the server answers, and `BeyRolePermissionEntry`, a permission `{ group, key }`
    as `GET /roles/permissions` answers it.
-   Roles page: those permissions in a foldable section per resource, each labelled
    `<permissionPrefix>.<group>.<action>.label` and described by `.description`, the library's keys as fallbacks.
-   Roles page: `groupIcons` on `BeyRolesConfig`, the icon of the section of each permission group; the library's own
    groups have theirs and any other one `faRectangleList`.
-   Roles page: `groupOrder` and `actionOrder` on `BeyRolesConfig` put the groups and actions they list first, in
    their order, the rest in server order; `groupOrder` is empty by default, `actionOrder` lists reading first.
-   Roles page: the name of a role the caller cannot edit, such as a base role, opens its permissions read-only, in the
    same sections disabled; a "Groups" column shows the `groupCount` of each role.
-   Roles page: for a superadmin, an organization column, the organization in the create form and, disabled, in the
    edit form, and with two active organizations or more an organization filter.
-   Roles page: `duplicate`, for the rows whose `actions` list it, opens the create form filled in with the role,
    "<name> (copy)" and the permissions the caller can give, and sends it as a `create`.
-   Roles page: rows with `sources` turn the page read-only, with no second request, an "Origin" column, "Direct" or
    "Group <names>", instead of the user and group counts; `BeyRoleSource` and `BeyRoleSourceType`.
-   Roles page: "View" in the header opens the permissions of the selected role when its row lists `view`, as its name
    does, for a member's roles and a manager's base roles.
-   Roles page: the labels and descriptions of the library's own permissions, `users.*`, `roles.manage` and
    `organization.*`, among them `organization.read`, `.read-groups`, `.read-group-roles` and `.read-roles`.
-   Roles page: the texts of the `roles.existing-name`, `.invalid-permissions`, `.not-found` and `.base-role` errors.
-   Session service: `organizationId` (absent for a superadmin) and `extraPermissions` (absent when the extra roles of
    the user add none) on `BeySessionUser`, read from the token.
-   Style guide: "Expand all" and "Collapse all" at the top, and a hash naming a module (`#tabs`, `#administration`)
    that opens its section and scrolls to it, on arrival or when a link changes it.
-   Styles: the `--bey-dialog-margin`, `--bey-dialog-max-height`, `--bey-grid-column-min-width`,
    `--bey-control-height` and `--bey-z-toolbar` tokens.
-   Styles: the `--bey-text-link` and `--bey-text-link-hover` tokens, the colour of a text button that reads as a link:
    the primary colour, mixed on hover with a quarter of the page.
-   Styles: the `--bey-danger-fg` and `--bey-danger-hover` tokens, the text and the hover of a danger button.
-   Styles: the `--bey-letter-spacing-tight`, `-snug`, `-wide`, `-wider` and `-widest` tokens, read by every letter
    spacing of the library.
-   Styles: the `--bey-primary-soft`, `--bey-success-soft`, `--bey-warning-soft` and `--bey-danger-soft` tokens, the
    soft accent of each intent, at 8%, 8%, 12% and 10% over transparent.
-   Styles: the `--bey-bg-page-translucent` token, the page at 70% over transparent, read by the floating preferences
    and the loading overlay.
-   Testing: `beyVisibleText(scope)`, the text of a fixture or an element as a reader sees it, one space between nodes.
-   Users page: for a superadmin, an organization column after the email, "System" on the superadmins' rows
    (`table.system`), from `GET {baseUrl}/organizations`, and with two active organizations or more a filter by it.
-   Users page: `organizationId` and `organizationName` on `BeyUserRow`, answered to a superadmin, both `null` on the
    row of a superadmin.
-   Users page: the invite form always asks a superadmin for the organization, required and chosen already when only
    one is active; a superadmin belongs to none, so nothing comes from the session.
-   Users page: the edit form shows a superadmin the organization of the user, disabled, next to the status; it is
    never sent, since users do not move.
-   Users page: the invite and edit forms offer the extra roles of the organization of the user as "Additional roles",
    a removable list searched above its rows, sent as `extraRoleIds`; for a superadmin they follow that organization.
-   Users page: the extra roles of each user after its roles in the table, and in the role filter by their `id`;
    `extraRoles` on `BeyUserRow`, `BeyUserExtraRole`, and the texts of the `users.invalid-extra-roles` error.
-   Users page: `editableFields` on `BeyUserRow` (`BeyUserEditableField`); the edit form disables every field the row
    leaves out and sends only those it names.
-   Users page: the edit form asks for the status, "Active" or "Inactive", sent as `status` with `PUT {baseUrl}/{id}`
    only when it changes.
-   Users page: `transfer`, on an inactive row that lists it, moves what the user owns (`GET {baseUrl}/{id}/content`)
    to the active user picked over `transfer-targets`, into a folder named after them (`POST {baseUrl}/{id}/transfer`).
-   Users page: `delete`, on one row or several that list it, confirms with what they own, what others use of it and
    the invitations that stop working, then sends `DELETE {baseUrl}/{id}` for each, one after the other.
-   Users page: `contentLabels` on `BeyUsersConfig` labels each kind of content the counts name; the texts of the
    `users.not-deletable`, `.transfer-source-not-inactive` and `.invalid-transfer-target` errors.
-   Users page: the texts of the `users.superadmin-role-fixed` error.
-   Users, groups and roles pages: a superadmin browses one folder per organization (`entryType: 'category'`), the
    list sending `parentId`, `null` at the root, with the rows of no organization at the root and a breadcrumb inside.
-   Users, groups and roles pages: a create from a folder comes with its organization and sends the `parentId` of the
    folder, or `null`, next to `organizationId`; a search at the root spans every organization.
-   Users, groups and roles pages: the text `categories.root`, the root of the breadcrumb of the folders, and
    `foldersHeight` (`'calc(100vh - 255px)'`), the height of the table while it shows the folders.
-   Users, groups and roles pages: with the folders, the organization column shows only in a search or a filter at
    the root, the one list where rows of several organizations meet.

### Changed

-   Administration module: the users module of 1.4.0 is now the users page of `administration`, the module of the
    users, groups, roles, organizations and organization summary pages; every export and text key stays as it was.
-   Floating preferences module: `--bey-floating-preferences-pill-bg` defaults to `--bey-bg-page-translucent`, the same
    colour.
-   Form module: an autocomplete also ignores accents and runs of spaces when it matches the typed text against the
    labels, with the fold express-components searches with.
-   Form module: a `BeyFormListField` grows up to seven and a half rows, `--bey-form-list-max-height`, and scrolls
    inside past them, the search of a list that holds ids staying above the rows.
-   Form module (breaking for types): `validators` of `BeyFormListField` takes `BeyFormFieldCustomValidator[]`, as the
    number, checkbox, chips and file fields do, so a length, pattern, email or url validator no longer compiles there.
-   Form module: `bey-form` is a flex column that may shrink (`min-height: 0`) instead of a block, so its sections
    scroll inside a dialog of bounded height.
-   Form and file preview modules: `--bey-modal-form-accent-soft` and `--bey-file-preview-accent-soft` default to
    `--bey-primary-soft`, the same colour.
-   Left menu module: the avatar of the user is `bey-avatar` of the cards module, painted through
    `--bey-cards-avatar-*`, its initials hidden from assistive technology.
-   Modal and tree modules: on a phone the dialog is padded with `--bey-space-lg`, `1rem`, instead of `1.15rem`.
-   Modal module: the icon of a confirmation sits on `--bey-primary-soft`, the primary at 8% instead of 10%, as the icon
    of an info does.
-   Modal, form, tree and file preview modules: every dialog is at most `--bey-dialog-max-height` high, its title and
    buttons fixed while its body scrolls (shrinks, in the file preview), so a long form no longer makes the page scroll.
-   Modal, form, tree and file preview modules: the other variables of a dialog, such as `--bey-modal-fg`,
    `--bey-modal-form-accent` or `--bey-file-preview-body-height`, are read from `:root` too, with the same defaults.
-   Page module: with `usagesConfig` and categories, `delete-category` asks `GET {baseUrl}/categories/usages?ids=` and
    warns with `<prefix>.modal.delete-category-in-use.title` and `.message` when what the folders hold is in use.
-   Page module: `name` of `BeyPageUser` and `BeyPageOwner` may be `null` and reads "Unknown"
    (`angular-components.user-name.unknown`), as does `beyPageOwnerCell` for an `ownerId` with a `null` `ownerName`.
-   Properties menu module: the attachment field names "Unknown", in the language in use, an attachment id none of its
    options is, once it has any, such as a deleted file; a variable reference still shows as typed.
-   Properties menu module: a disabled option of a segmented field and the node dragged in a tree fade to
    `--bey-opacity-disabled`, `0.5`, instead of `0.4` and `0.45`.
-   Style guide: every section folds under its title and a chevron, collapsed at first, rendered and controlled by its
    title only while open, the open ones remembered in `sessionStorage`; Users is now Administration, with every page.
-   Styles: `.bey-floating-preferences-anchor` sits `--bey-space-lg`, `1rem`, from the bottom and the right of the
    window, instead of `15px` and `20px`.
-   Toast module: the title and the message at `--bey-font-size-sm`, `0.8125rem` instead of `0.84rem`; the message at
    `--bey-line-height-loose`, `1.6` instead of `1.5`, `0.125rem` under the title instead of `0.15rem`.
-   Toast module: the stripe at `--bey-border-width-thick`, `2px` instead of `3px`, and the progress bar at
    `--bey-opacity-disabled`, `0.5` instead of `0.4`.
-   Users page: "Roles" of the invite and edit forms is a list with a search above and a remove button per row
    instead of checkboxes, saying "Choose one role at least." while empty; the requests do not change.
-   Users page: `GET {baseUrl}/roles` is read as `{ roles, extraRoles }`; a server that answers no `extraRoles` counts
    as one without extra roles.
-   Users page: the `users.superadmin-only` text speaks only of changing a superadmin account, since nobody grants
    nor removes the superadmin role any more.
-   Users page: the `users.own-account` text also names the name, which is changed on the account page.

### Fixed

-   Form module: a form of `openWithRequest`, also in `BeyFakeModalFormService`, stays open without an unhandled error
    when its request fails.
-   Form module: the suggestions of an autocomplete keep their height and its panel scrolls past `13rem`, so ten or
    more no longer squeeze into it, overlapping and cut.
-   Form module: `--bey-form-autocomplete-panel-max-height`, set on the field, an ancestor or `:root`, now decides the
    height of the autocomplete panel, `13rem` by default; an inline `208px` used to win.
-   Form module: an autocomplete points its input at its suggestions through `aria-controls` only while they show, no
    longer at a panel that is not there.
-   Header module: the header keeps `--bey-control-height`, the height of a text button, as its least height, so its
    title no longer moves when the actions of a selection show or hide.
-   Page module: the trash origin on the tooltip of a row ends with the row's own name, so it reads as the place of
    that row.
-   Page module: the menus of the header open over the search toolbar again; the search sits in the `--bey-z-toolbar`
    layer, over the sticky header of the table and under the menus.
-   Page module: the entries of a move and of the trash read their type from the `typeField` of the categories, still
    sent as `{ id, type }`, so rows may keep a `type` field of their own; without categories every entry is an `item`.
-   Page module: a failed create, edit, `afterCreate` or `confirmSave` leaves no unhandled error; when `afterCreate`
    fails the form stays open and the table reloads, and sending the form again creates the row anew.
-   Page module: the duplicate form takes the proposed copy name as it is; its submit no longer waits for an edit.
-   Properties menu module: `aria-controls` names only what is there: the body of a group while it is expanded, and the
    options of a searchable select or an attachment picker while they show.
-   Session service: `beyAuthGuard` lets a path of `allowedPaths` open that page and the pages under it only, no
    longer one whose path merely begins with it, as `/administration/organizations` for `/administration/organization`.
-   Tree module: the icon of the tree dialog sits on `--bey-primary-soft`, so it shows in the dark theme too, where a
    black tint vanished on the dark surface.

### Removed

-   Form module: `--bey-modal-form-body-max-height`, which never took effect; `--bey-modal-form-max-height` caps the
    whole dialog.
-   HTTP service: the `document-generation.*` error texts and their titles, which only the document builder service
    sends; the app that sends those requests writes them, under `angular-components.http.*.document-generation`.
-   Style guide: the `angular-components-style-guide.components` text, which nothing showed.
-   Toast module: `--bey-toast-accent-soft`, which every kind of toast declared and nothing read.
-   Users page: the `change-status` action, with its `actions.change-status.*`, `change-status.*` and
    `toast.change-status-success` texts; the status is changed in the edit form.

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
