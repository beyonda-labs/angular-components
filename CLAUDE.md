# angular-components

The publishable Angular component library (`ui-components`). It is consumed by the `*-front` repo of each
product.

## Before writing anything

Read `c:\Dev\Personal\beyonda-labs\rules\index.md` and the file that matches the task. For this repo
`rules/angular/library.md` applies as well to anything touching exports, packaging or module READMEs.

## What is specific to this repo

- **The `bey` prefix**: selectors (`bey-tabs`), CSS classes (`.bey-tabs-tab`), custom properties (`--bey-*`)
  and public exports (`BeyTabsComponent`).
- **The token catalogue** lives in `docs/tokens.md`. It is the only normative document here, and it is the
  surface a consuming app overrides to apply its own theme.
- **Translations**: after touching any module's `*.en.json` / `*.es.json`, run `pnpm run merge-translations`.
  The bundles under `src/lib/assets/i18n/` and `src/lib/assets/i18n-style-guide/` are generated and are never
  edited by hand.
- **Tests**: `pnpm test`. There is no `ng test` target.
- **Gates**: `pnpm run verify` runs every check over the whole repo. It fails today on purpose — passing it is
  what finishes the standardisation tracked in `docs/to-do.md`.
- **Change detail** goes in `docs/change-log.md`. There is no `CHANGELOG.md` at the root.
