# Footer (`bey-footer`)

Barra de pie de página que muestra la identidad de marca del producto (icono, organización y nombre de producto) y, opcionalmente, enlaces legales (Términos y condiciones, Política de privacidad) que navegan mediante Angular Router.

---

## Quick start

```ts
import { BeyFooterComponent, FooterConfig } from '@beyonda-labs/angular-components';
```

```html
<bey-footer [config]="footerConfig" />
```

```ts
footerConfig = new FooterConfig({
    iconSrc: '/assets/icon.png',
    productName: 'my-app.footer.productName',
    orgName: 'my-app.footer.orgName',   // opcional — por defecto "Beyonda Labs"
    termsUrl: '/terms',                  // opcional
    privacyUrl: '/privacy'               // opcional
});
```

---

## `FooterConfig`

| Propiedad      | Tipo     | Requerido | Descripción                                                                          |
| -------------- | -------- | --------- | ------------------------------------------------------------------------------------ |
| `iconSrc`      | `string` | Sí        | Ruta de la imagen del icono de marca                                                 |
| `productName`  | `string` | Sí        | Clave i18n o texto literal del nombre del producto                                   |
| `orgName`      | `string` | No        | Clave i18n o texto literal del nombre de la organización. Por defecto `"Beyonda Labs"` |
| `privacyUrl`   | `string` | No        | Ruta Angular para la página de privacidad. Oculta el enlace si no se define          |
| `termsUrl`     | `string` | No        | Ruta Angular para la página de términos. Oculta el enlace si no se define            |

Los valores de `productName` y `orgName` se pasan directamente al pipe `translate`, por lo que pueden ser claves i18n de la app consumidora o texto literal.

---

## i18n

Claves de la librería bajo el prefijo `angular-components.footer`:

| Clave                               | EN                       | ES                          |
| ----------------------------------- | ------------------------ | --------------------------- |
| `angular-components.footer.terms`   | Terms & Conditions       | Términos y condiciones      |
| `angular-components.footer.privacy` | Privacy Policy           | Política de privacidad      |
| `angular-components.footer.legal`   | Legal                    | Legal                       |

> `angular-components.footer.legal` se usa como `aria-label` del `<nav>` de enlaces legales.

---

## CSS custom properties

| Variable                | Light                            | Dark                             | Descripción                        |
| ----------------------- | -------------------------------- | -------------------------------- | ---------------------------------- |
| `--bey-footer-fg`       | `--bey-gray-600`                 | `--bey-gray-600`                 | Color del nombre del producto      |
| `--bey-footer-fg-2`     | `--bey-gray-700`                 | `--bey-gray-500`                 | Color del nombre de la organización|
| `--bey-footer-link`     | `--bey-gray-700`                 | `--bey-gray-500`                 | Color de los enlaces legales       |
| `--bey-footer-link-hover`| `--bey-gray-900`                | `--bey-gray-50`                  | Color de los enlaces en hover/focus|
| `--bey-footer-sep`      | `--bey-gray-300`                 | `--bey-gray-800`                 | Color del separador `—`            |
| `--bey-footer-border`   | `--bey-gray-200`                 | `--bey-gray-900`                 | Color del borde superior           |
| `--bey-footer-shadow`   | `0 -2px 4px rgba(white, 0.9)`   | `0 -2px 8px rgba(black, 0.7)`   | Sombra sobre el borde superior     |
| `--bey-footer-font`     | `'Helvetica Neue', 'Helvetica', 'Inter', 'Arial', system-ui, sans-serif` | — | Familia tipográfica |

El dark mode se activa automáticamente con `:host-context(body.dark)`. El icono de marca recibe `filter: invert(1)` en modo oscuro.

---

## Dark mode

```css
:host {
    --bey-footer-border: #custom-border;
}

:host-context(body.dark) {
    --bey-footer-border: #custom-border-dark;
}
```
