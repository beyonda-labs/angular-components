# Component Style-Guide pattern

Each module exposes an independent style-guide component that serves as an interactive demo. All follow the same pattern.

## File structure

```
<module>/docs/style-guide/
├── assets/
│   ├── <module>-style-guide.en.json
│   └── <module>-style-guide.es.json
├── <module>-style-guide.component.ts
├── <module>-style-guide.component.html
└── <module>-style-guide.component.css   ← optional, only if custom CSS is needed
```

## TypeScript component

Standalone component with:

-   **`selector`**: `bey-<module>-style-guide`
-   **`imports`**: the module's main component + `TranslateModule` + anything needed for the examples (e.g. `ButtonComponent` for action buttons)
-   **No `ChangeDetectionStrategy`**: leave the default value (`Default`)
-   Example configurations are built in the **constructor** when fixed, or as **getters** when they need to be recreated on each call (e.g. `ButtonConfig` with callbacks)
-   Services from the module itself are injected with `inject()` when the example requires it (e.g. `ModalService`, `ToastService`, `LoadingService`)
-   Reactive state variables (active values, last clicks, flags) are plain class properties

```typescript
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FooComponent } from '../../foo.component';
import { FooConfig } from '../../models/foo.model';

@Component({
    imports: [FooComponent, TranslateModule],
    selector: 'bey-foo-style-guide',
    standalone: true,
    styleUrls: ['./foo-style-guide.component.css'],
    templateUrl: './foo-style-guide.component.html'
})
export class FooStyleGuideComponent {
    config: FooConfig;

    constructor() {
        this.config = new FooConfig({ ... });
    }
}
```

### When to use getter vs constructor for configurations

| Situation                               | Constructor | Getter |
| --------------------------------------- | ----------- | ------ |
| Static configuration (does not change)  | ✓           |        |
| `ButtonConfig` with callbacks or state  |             | ✓      |
| Object must be recreated on each render |             | ✓      |

## Typography and visual hierarchy

### Levels in the global style-guide (`style-guide.component.html`)

| Element              | Classes                    | Usage                                              |
| -------------------- | -------------------------- | -------------------------------------------------- |
| `<h1>`               | `mb-4 text-dark fs-1`      | Page title (only one, at the top)                  |
| `<h2>`               | `mb-3 text-muted fs-3`     | Section grouping (e.g. "Components")               |
| `<h3>` first module  | `mb-2 text-dark fs-4`      | Name of the first module in each group (no `mt-5`) |
| `<h3>` other modules | `mb-2 mt-5 text-dark fs-4` | Module name with top spacing                       |

### Levels inside each module style-guide

| Element            | Classes                                       | Usage                                              |
| ------------------ | --------------------------------------------- | -------------------------------------------------- |
| `<p>` description  | `bey-style-guide-description text-muted mb-3` | Brief mandatory description, always the first line |
| `<h4>` sub-example | `mt-4 mb-3 fs-6 fw-semibold text-dark`        | Title for each variant or group of examples        |

### Rules about descriptions

-   The description paragraph (`bey-style-guide-description`) is **mandatory** in all module style-guides. It is the first line of the template.
-   It must briefly explain what the component does and the usage pattern (object-based configuration, callbacks, etc.). One or two sentences.
-   Always served from translations with the key `angular-components-style-guide.<module>.example`.
-   The global style-guide does **not** include descriptions between `<h3>` and the card, only the title.

### Rules about `<h4>` subtitles

-   Only used when there is **more than one example** within the same card.
-   If there is only one example, no `<h4>` is added — the component goes directly after the description.
-   The text can be a translation key or literal text when the name is technical/universal (e.g. `"Inline"`, `"Overlay"`, `"Service"`).

## HTML template

The template always starts with a description paragraph, followed by the examples:

```html
<p class="bey-style-guide-description text-muted mb-3">
    {{ 'angular-components-style-guide.<module>.example' | translate }}
</p>

<!-- Single simple example: no h4 -->
<bey-foo [config]="config"></bey-foo>

<!-- Multiple examples: separate with h4 -->
<h4 class="mt-4 mb-3 fs-6 fw-semibold text-dark">
    {{ 'angular-components-style-guide.<module>.examples.basic' | translate }}
</h4>
<bey-foo [config]="basicConfig"></bey-foo>

<h4 class="mt-4 mb-3 fs-6 fw-semibold text-dark">
    {{ 'angular-components-style-guide.<module>.examples.icons' | translate }}
</h4>
<bey-foo [config]="iconsConfig"></bey-foo>
```

### Examples that trigger actions (modal, toast, loading)

Use internal library buttons in a flex wrapper:

```html
<div class="d-flex flex-wrap gap-2 mt-3 bey-<module>-style-guide-actions">
    <span class="bey-<module>-style-guide-action-slot">
        <bey-button [button]="primaryButton"></bey-button>
    </span>
    <span class="bey-<module>-style-guide-action-slot">
        <bey-button [button]="secondaryButton"></bey-button>
    </span>
</div>
```

### Showing reactive state

To reflect values like the active tab or the last clicked item, add an info block below the component:

```html
<!-- With @if when only shown if there is a value -->
@if (lastClicked) {
    <div class="bey-<module>-style-guide-info text-muted mt-2">
        {{ 'angular-components-style-guide.<module>.clicked' | translate }}:
        <strong>{{ lastClicked }}</strong>
    </div>
}

<!-- Without @if when always shown -->
<div class="bey-<module>-style-guide-active text-muted mt-2">
    {{ 'angular-components-style-guide.<module>.active' | translate }}:
    <strong>{{ activeKey }}</strong>
</div>
```

## Style-guide CSS

Only created if there are demo-specific styles (fixed-size containers, preview grids, etc.). The minimum mandatory rule if the file exists:

```css
:host {
    display: block;
}
```

All other classes follow the `bey-<module>-style-guide-*` prefix.

## Translations

Each JSON file is nested under the global key `angular-components-style-guide.<module>`:

```json
{
    "angular-components-style-guide": {
        "<module>": {
            "example": "Component description for the style-guide.",
            "examples": {
                "basic": "Basic",
                "icons": "With icons"
            }
        }
    }
}
```

The `example` key is mandatory (initial description paragraph). The rest of the keys depend on the examples in the demo.

## Registering in the global style-guide

Once created, the component must be registered in three places:

### 1. `style-guide.component.ts`

Add the import and declare it in `imports[]`:

```typescript
import { FooStyleGuideComponent } from '../foo/docs/style-guide/foo-style-guide.component';

@Component({
    imports: [
        // ... rest
        FooStyleGuideComponent,
    ],
    ...
})
export class StyleGuideComponent {}
```

### 2. `style-guide.component.html`

Add a section with the `<h3>` + `.bey-style-guide-card` pattern:

```html
<h3 class="mb-2 mt-5 text-dark fs-4">{{ 'angular-components-style-guide.foo' | translate }}</h3>

<div class="bey-style-guide-card p-4 border rounded-4">
    <bey-foo-style-guide></bey-foo-style-guide>
</div>
```

> If the component needs to occupy the full card space (e.g. a full screen), add `style="overflow: hidden;"` to the div and omit `p-4`.

### 3. Global style-guide translations

In `src/lib/components/style-guide/assets/style-guide.en.json` and `.es.json`, add the section title key:

```json
{
    "angular-components-style-guide": {
        "foo": "Foo"
    }
}
```

## Checklist

-   [ ] `docs/style-guide/` folder created inside the module
-   [ ] `<module>-style-guide.component.ts` with selector `bey-<module>-style-guide`
-   [ ] `<module>-style-guide.component.html` with initial `bey-style-guide-description` paragraph
-   [ ] Translations `*.en.json` and `*.es.json` with mandatory `example` key
-   [ ] CSS with `:host { display: block; }` if needed (omit if empty)
-   [ ] Registered in `style-guide.component.ts` (import + `imports[]`)
-   [ ] Registered in `style-guide.component.html` (`h3` section + card)
-   [ ] Title key added to `style-guide.en.json` and `style-guide.es.json`
