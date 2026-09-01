# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- **pdf-viewer**: new `bey-pdf-viewer` component, a thin wrapper around `ngx-extended-pdf-viewer` with its native
  toolbar hidden by default, an imperative API (`goToPage`, `setZoom`, `rotate`) and a curated set of outputs
  (page, zoom, rotation, load, click) for building a custom toolbar.
- **properties-menu**: new `bey-properties-menu` component — a contextual property inspector with data-driven
  tabs, groups and typed fields (text, number, select, toggle, color, segmented, spacing), a tree-content group
  for structure browsing, a list-content group for card catalogs, and variable insertion support.
- **header**: optional `backAction` (rendered before the title), optional `badge` next to the title, and a
  `variant` (`Page`/`SubPage`) controlling title size — `leftActions`/`menuActions`/`rightActions` now render as a
  single end-aligned group instead of opposite sides.
- **tabs**: tabs that don't fit the available width now collapse into a "…" overflow menu instead of clipping;
  the active tab always stays visible.
- **app-layout**: the left menu's expanded/collapsed state is now persisted (`AppLayoutService.setExpanded`,
  backed by `localStorage`); new `useBodyPadding` config option; `AppLayoutTopAction`/`AppLayoutBottomAction` now
  accept an `action` callback (run in addition to `onMenuActionClick`) and `disabled`.
- **left-menu**: when a parent action has both its own `action` and `subActions` and the menu is expanded inline,
  clicking its label now runs the action while clicking the chevron toggles the submenu (previously any click
  toggled the submenu).
- **floating-preferences**: new `usePill` input to render the language/theme selectors without the floating pill
  wrapper, for embedding in another container.
- **footer**: now renders the language/theme switcher (`bey-floating-preferences`) inline.

### Changed

- **page**: `PageFormConfig`/`ModalFormConfig` are now generic over the form value type instead of `unknown`,
  giving `onCreate`/`onEdit` callbacks a properly typed value.
- **http**: improved reliability of requests configured with `loading`/`successToast`/`onSuccess` options when the
  caller also subscribes to the returned observable.
