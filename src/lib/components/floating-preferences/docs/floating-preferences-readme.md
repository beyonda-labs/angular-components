# Floating Preferences (`bey-floating-preferences`)

Pill flotante con dos selectores — idioma y tema — que se autogestiona completamente. No requiere configuración externa: lee y escribe el estado directamente en `TranslateService` y `BeyThemeService`.

Capacidades:

-   Selector de idioma vinculado a `TranslateService`. Al cambiar, llama a `translateService.use(lang)` de forma inmediata.
-   Selector de tema vinculado a `BeyThemeService`. Al cambiar, aplica la clase `dark` al `<body>` y persiste la preferencia en `localStorage`.
-   Al montar en una nueva ruta, recupera automáticamente el tema guardado — no necesita que el padre recuerde el estado.
-   Diseño de píldora con `backdrop-filter` y animación de entrada.
-   Dark mode nativo vía `:host-context(body.dark)`.
-   Totalmente independiente: sin `@Input`, sin callbacks.

---

## Quick start

```ts
import { BeyFloatingPreferencesComponent } from '@beyonda-labs/angular-components';
```

```html
<bey-floating-preferences />
```

El componente no acepta inputs. Para reaccionar al cambio de tema desde fuera, inyecta `BeyThemeService`.

---

## Suscribirse al tema desde otro componente

```ts
import { BeyThemeService } from '@beyonda-labs/angular-components';

@Component({ ... })
export class MiComponente {
    private readonly themeService = inject(BeyThemeService);

    readonly theme$ = this.themeService.theme$;
    readonly currentTheme = this.themeService.currentTheme;
}
```

Para cambiar el tema programáticamente:

```ts
this.themeService.setTheme('dark');
```

---

## `BeyThemeService`

| Miembro          | Tipo                     | Descripción                                        |
| ---------------- | ------------------------ | -------------------------------------------------- |
| `theme$`         | `Observable<BeyTheme>`   | Emite cada vez que cambia el tema                  |
| `currentTheme`   | `BeyTheme`               | Valor actual del tema sin necesidad de suscripción |
| `setTheme(theme)`| `void`                   | Cambia el tema, actualiza el body y persiste       |

```ts
export type BeyTheme = 'light' | 'dark';
```

---

## Dark mode

La clase `dark` se aplica al `<body>` cuando el tema es oscuro. Cualquier componente puede reaccionar con `:host-context(body.dark)` en su CSS:

```css
:host {
    --mi-componente-bg: #ffffff;
}

:host-context(body.dark) {
    --mi-componente-bg: #0a0a0a;
}
```

Los estilos globales (Bootstrap, datepicker) van en `overrides.css` bajo `body.dark { }`.

---

## CSS custom properties

| Variable              | Light                        | Dark                         | Descripción                   |
| --------------------- | ---------------------------- | ---------------------------- | ----------------------------- |
| `--bey-fp-fg`         | `#3d3d3c`                    | `#c8c8c6`                    | Color de texto de los selects |
| `--bey-fp-fg-hover`   | `#0a0a0a`                    | `#f5f5f3`                    | Color de texto en hover       |
| `--bey-fp-fg-muted`   | `#6b6b69`                    | `#8f8f8d`                    | Color del icono chevron       |
| `--bey-fp-bg-hover`   | `#fafaf9`                    | `#1c1c1b`                    | Fondo en hover y focus        |
| `--bey-fp-border-focus`| `#d8d8d5`                   | `#2e2e2c`                    | Borde del select en focus     |
| `--bey-fp-pill-bg`    | `rgba(255,255,255,0.7)`      | `rgba(10,10,10,0.6)`         | Fondo de la píldora           |
| `--bey-fp-pill-border`| `rgba(0,0,0,0.08)`           | `rgba(255,255,255,0.1)`      | Borde de la píldora           |
| `--bey-fp-pill-shadow`| `0 4px 20px rgba(0,0,0,.12)` | `0 4px 20px rgba(0,0,0,.4)`  | Sombra de la píldora          |

---

## Persistencia

| Preferencia | Clave en `localStorage` |
| ----------- | ----------------------- |
| Tema        | `bey-theme`             |

El idioma no se persiste en `localStorage` — lo gestiona la app consumidora a través de `TranslateService`.
