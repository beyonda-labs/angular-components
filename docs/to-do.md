# Roadmap

## Phase 0 - Quality foundation

- [x] Real library README
- [x] DX scripts (`lint:fix`, `format`, `test:report`)
- [ ] CI pipeline (lint + test + build) _(pending)_
- [ ] Pre-commit hooks (husky + lint-staged) _(pending)_

## Phase 1 - Complete Form module

- [x] Field types: `select`, `checkbox`, `radio`, `textarea`, `date`, `text`, `number`
- [x] Advanced validators (`email`, `url`, `custom sync`, `async`)
- [x] Accessibility (`aria-required`, `aria-invalid`, `aria-label`) across all fields

## Phase 2 - Core UI

- [ ] Layout: `card`, `panel`
- [x] Feedback: `toast`, `loading spinner` (inline + overlay + service)
- [ ] Feedback: `alert`, `progress bar`
- [x] Modals (info, warning, error, confirmation via service)
- [ ] Drawers

## Phase 3 - Data and navigation

- [x] Table / grid (configurable columns, sorting, row selection)
- [ ] Table / grid: filters
- [x] Pagination
- [x] Tabs
- [x] Breadcrumb
- [x] Sidebar (`left-menu` with grouped actions, sub-actions and collapse)
- [x] Header (configurable left / right actions)

## Phase 4 - Rich interactions

- [ ] Text editor
- [ ] Drag & drop and reorderable lists
- [ ] File board / manager

## Phase 5 - Delivery

- [x] Demo component (`style-guide` with simple / composite sections)
- [ ] Storybook
- [ ] API docs (TypeDoc)

---

## Components outside the original roadmap

- [x] `app-layout` (full layout with integrated left-menu, breadcrumb and footer)
- [x] `login` (authentication with light/dark theme and optional OAuth providers)
- [x] `footer`
- [x] `floating-preferences` (theme and language selector)
