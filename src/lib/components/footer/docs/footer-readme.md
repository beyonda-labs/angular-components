# Footer

A one-line bar with the product's brand, optional legal links and the language and theme selector embedded on
the right. Everything it shows comes from a config model.

## Usage

```ts
const footer = new BeyFooterConfig({
    iconSrc: 'assets/icon.svg',
    productName: 'myApp.productName',
    termsUrl: '/terms',
    privacyUrl: '/privacy'
});
```

```html
<bey-footer [config]="footer"></bey-footer>
```

## BeyFooterConfig

| Field         | Required | Default          | Meaning                                                 |
| ------------- | -------- | ---------------- | ------------------------------------------------------- |
| `iconSrc`     | yes      |                  | Path to the brand icon                                   |
| `productName` | yes      |                  | A literal name or an i18n key                            |
| `orgName`     | no       | `Beyonda Labs`   | A literal name or an i18n key                            |
| `termsUrl`    | no       | none             | Router path; the terms link appears only when it is set   |
| `privacyUrl`  | no       | none             | Router path; the privacy link appears only when it is set |

Links navigate through the Angular router, so the urls are router paths and not hrefs.

## Theming

| Variable                   | Default                |
| -------------------------- | ---------------------- |
| `--bey-footer-fg`          | `--bey-text-muted`     |
| `--bey-footer-fg-2`        | `--bey-text-secondary` |
| `--bey-footer-link`        | `--bey-text-secondary` |
| `--bey-footer-link-hover`  | `--bey-text-primary`   |
| `--bey-footer-sep`         | `--bey-border-default` |
| `--bey-footer-border`      | `--bey-border-subtle`  |
| `--bey-footer-font`        | system sans-serif stack |

The brand icon is inverted under `body.dark`, since an icon drawn for a light background cannot be recoloured
through tokens.
