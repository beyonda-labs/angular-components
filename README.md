# @beyonda-labs/angular-components

Model-driven Angular component library for back-office applications.
Built with Angular 19, Bootstrap 5 and standalone components.

## Installation

```bash
npm install @beyonda-labs/angular-components
```

Make sure all peer dependencies are installed in the consuming app:
`@angular/*`, `@ngx-translate/core`, `bootstrap`, `ngx-bootstrap`, `rxjs`.

---

## Quick start

```ts
import {
    BeyFormConfig,
    BeyFormSection,
    BeyFormRow,
    BeyFormTextField,
    BeyFormButton,
    BeyFormButtonType
} from '@beyonda-labs/angular-components';

const form = new BeyFormConfig({
    i18nPrefix: 'myForm',
    sections: [
        new BeyFormSection({
            key: 'personal',
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({ key: 'name', isRequired: true }),
                        new BeyFormTextField({ key: 'email' })
                    ]
                })
            ]
        })
    ],
    buttons: [
        new BeyFormButton({ type: BeyFormButtonType.Cancel, label: 'cancel' }),
        new BeyFormButton({ type: BeyFormButtonType.Submit, label: 'save' })
    ],
    onSubmit: value => console.log(value)
});
```

```html
<bey-form [config]="form"></bey-form>
```

---

## Components

| Component   | Selector            | Status   |
| ----------- | ------------------- | -------- |
| Form        | `<bey-form>`        | Stable   |
| Header      | `<bey-header>`      | Stable   |
| Left Menu   | `<bey-left-menu>`   | Stable   |
| Table       | `<bey-table>`       | Stable   |
| Style Guide | `<bey-style-guide>` | Internal |

Component documentation:

-   [Form](src/lib/components/form/docs/form-readme.md)
-   [Header](src/lib/components/header/docs/header-readme.md)
-   [Left Menu](src/lib/components/left-menu/docs/left-menu-readme.md)
-   [Table](src/lib/components/table/docs/table-readme.md)

---

## Development

### Setup

```bash
npm install
```

### Commands

| Command                      | Description                                        |
| ---------------------------- | -------------------------------------------------- |
| `npm start`                  | Start dev server                                   |
| `npm test`                   | Run unit tests                                     |
| `npm run test:watch`         | Tests in watch mode                                |
| `npm run test:coverage`      | Tests with coverage summary                        |
| `npm run test:report`        | Tests with lcov + html coverage report             |
| `npm run lint`               | Run ESLint                                         |
| `npm run lint:fix`           | Run ESLint with auto-fix                           |
| `npm run format`             | Format source with Prettier                        |
| `npm run build`              | Full build (tests + merge translations + ng build) |
| `npm run build:quick`        | Build without running tests                        |
| `npm run merge-translations` | Validate and merge i18n files                      |

### i18n

Translation files live at `src/lib/assets/i18n/` and inside each component's `assets/` folder.
Run `npm run merge-translations` to validate and consolidate keys before building.

### Publishing

The package is published to GitHub Packages (`https://npm.pkg.github.com/`).

```bash
npm run build
cd dist/beyonda-labs/angular-components
npm publish
```

---

## License

MIT
