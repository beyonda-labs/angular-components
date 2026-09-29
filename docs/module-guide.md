# Working on a module

The steps to create a module or change one, from the branch to the push. Each step says which rule applies and
what to touch; the rules themselves live in `c:\Dev\Personal\beyonda-labs\rules\` and are not repeated here.

## 1. Before writing

-   **Branch off `develop`**: `feature/<name>` for something new, `fix/<name>` for a bug. Never work on `main`.
-   **Read [`rules/index.md`](https://github.com/beyonda-labs/rules/blob/main/index.md)** and every file its table points to for the change:

| Touching                                        | Rule                     |
| ----------------------------------------------- | ------------------------ |
| The component, its template or its children     | `angular/component.md`   |
| A config or any other model class               | `angular/class-model.md` |
| A service                                       | `angular/service.md`     |
| CSS                                             | `angular/styles.md`      |
| Texts                                           | `angular/i18n.md`        |
| A spec                                          | `angular/test.md`        |
| Exports, the README, the style-guide, packaging | `angular/library.md`     |
| The commit and the change-log                   | `commits.md`             |

## 2. Where everything goes

| What                 | Where                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| The module           | `src/lib/components/<module>/`: component, `models/` for contracts, `services/`, `functions/` for stateless logic, `components/` for children |
| Its texts            | `src/lib/components/<module>/assets/<module>.en.json` and `.es.json`                                                                          |
| Its README           | `src/lib/components/<module>/docs/<module>-readme.md`                                                                                         |
| Its exports          | `src/lib/components/<module>/public-api.ts`                                                                                                   |
| Its demo             | `style-guide/src/<module>/`, with its own `assets/` for the demo texts                                                                        |
| A new design value   | `src/lib/assets/styles/tokens.css`, documented in `docs/tokens.md`                                                                            |
| A shared test helper | `testing/src/dom.ts`, only when it is generic; otherwise it stays in the spec                                                                 |
| A test double        | `testing/src/services/fake-<service>.service.ts`, for a public service a consumer's spec stubs                                                |

## 3. While writing

-   **Texts**: keys under `angular-components.<module>.*` for the module and
    `angular-components-style-guide.<module>.*` for its demo, in both languages with the same keys. After any
    change to a `.json`, run `pnpm run merge-translations`; the bundles under `src/lib/assets/i18n*/` are
    generated and committed with the change, never edited by hand.
-   **Styles**: read tokens only. When a value has no token, the token is created first in `tokens.css` and
    listed in `docs/tokens.md`.
-   **Tests**: one spec per unit with behaviour, using `@testing/dom` for rendering and generic queries.

## 4. Exports

-   **The module's `public-api.ts`** exports the entry component, its models (`<Name>Parameters` as
    `export type`), services, providers and guards, every name with the `Bey` prefix.
-   **The root `src/public-api.ts`** re-exports it under its layer: `primitives`, `composites` or `product`.
-   **Nothing else is exported**: not the children, not `internal/`, not the demo.
-   **A public service that opens a dialog or a toast gets its fake** in the `testing` entry point: exported from
    `testing/src/public-api.ts` as `BeyFake<Service>` and registered by `provideBeyTesting` in place of the real
    one, with its README row in `testing/docs/testing-readme.md`.

## 5. Documentation

-   **The module README**, created with the module and updated with every change a consumer notices: a new or
    removed config field, a new callback, a changed behaviour.
-   **The demo** in `style-guide/src/<module>/`, showing each variant and each callback. A new module is also
    registered in `style-guide/src/style-guide.component.ts` (import) and `.html` (a
    `<bey-style-guide-section>` with the key `angular-components-style-guide.<module>-section`).
-   **The root `README.md`**, when a module is created or removed: the components table and the list of module
    READMEs.
-   **`docs/change-log.md`**, under `[Unreleased]`: one line per change a consumer notices, two at most, starting
    with the module (`Tabs module: …`) under `Added`, `Changed`, `Removed` or `Fixed`. A bug introduced and fixed
    within the same work is not listed. A removed or renamed export always has its `Removed` or `Changed` line.
-   **`docs/to-do.md`**, when the change closes or opens a roadmap item.

## 6. Before committing

Fix first, then check. The fixers rewrite files; the checks only report.

```bash
pnpm run merge-translations   # only if a .json changed
pnpm run lint:fix             # ESLint autofix
pnpm run stylelint:fix        # declaration order and the rest of the CSS autofixes
pnpm run format               # Prettier, including the order of template attributes
pnpm run verify               # everything Jenkins checks, plus the format
pnpm run build                # every entry point: the library, testing and the style-guide
```

What `verify` runs, and what to do when each step fails:

| Step                 | Checks                                                              | When it fails                                        |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| `ng lint`            | ESLint over `src`, `style-guide` and `testing`                      | `lint:fix`, then the rest by hand                    |
| `typecheck`          | TypeScript over every spec and the code they reach                  | By hand; jest never reports these                    |
| `stylelint`          | Naming, tokens, no `!important`, declaration order                  | `stylelint:fix`, then the rest by hand               |
| `check-translations` | Same keys in both languages, kebab-case, depth, no duplicate owners | Fix the `.json`, then `merge-translations`           |
| `check-tokens`       | Every `var(--bey-*)` read in CSS is defined                         | Create the token in `tokens.css` or fix the name     |
| `check-style-guides` | Every module has a demo, registered, and a README                   | Add the missing one                                  |
| `format:check`       | Prettier over `ts`, `html`, `css`, `json`                           | `format`                                             |
| `test:ci`            | Every spec, with the coverage thresholds of `beyonda.config.json`   | Fix the code or the spec; never lower the thresholds |

## 7. Commit and push

-   **Only with express authorisation**, for the commit and for the push.
-   **One line**, Conventional Commits: `<type>(<module>): <description>`. No body, no `Co-Authored-By`.
-   **One commit per module or per concern**: the module, its demo, its README and its change-log line go
    together; an unrelated fix goes apart.
-   **The pre-commit hook** runs ESLint, stylelint and Prettier with autofix on the staged files. A commit it
    blocks is fixed, never bypassed with `--no-verify`.
-   **Jenkins**, on push, runs `pnpm run lint` (the first six steps above), `pnpm run test:ci` and
    `pnpm run build`, then publishes a snapshot `<version>-<branch>.<build>.<sha>`. It does not check the format.
-   **The branch merges back into `develop`** once Jenkins is green.

## 8. Checklist

-   [ ] Branch off `develop`, rules read
-   [ ] Module, texts in both languages, `merge-translations` run
-   [ ] New tokens in `tokens.css` and `docs/tokens.md`
-   [ ] Specs for the new behaviour
-   [ ] Exports in the module and root `public-api.ts`, `Bey` prefix
-   [ ] Module README
-   [ ] Demo updated, and registered if the module is new
-   [ ] Root README, if the module is new or removed
-   [ ] Change-log line under `[Unreleased]`
-   [ ] `verify` and `build` green
-   [ ] Commit and push authorised
