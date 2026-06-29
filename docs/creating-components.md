# Guide for creating new components

## Component types

Before starting, identify what type the new component is:

| Type              | When to use                                                            | Examples in the repo                         |
| ----------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| **Simple UI**     | A single visual element, no sub-components or complex logic            | `breadcrumb`, `header`, `pagination`, `tabs` |
| **Composite**     | Coordinates internal sub-components                                    | `form`, `app-layout`, `table`, `left-menu`   |
| **Service-Based** | The public API is a service; the component is an implementation detail | `modal`, `toast`                             |

---

## Folder structure

All components follow the same base structure. Folders marked as optional are only created if the component needs them.

```
src/lib/components/
└── my-component/
    ├── assets/                               (optional) i18n translations
    │   ├── my-component.en.json
    │   └── my-component.es.json
    ├── components/                           (optional) internal sub-components
    │   └── sub-item/
    │       ├── sub-item.component.ts
    │       ├── sub-item.component.html
    │       └── sub-item.component.spec.ts
    ├── docs/
    │   ├── style-guide/
    │   │   ├── my-component-style-guide.component.ts
    │   │   ├── my-component-style-guide.component.html
    │   │   └── assets/
    │   │       ├── my-component-style-guide.en.json
    │   │       └── my-component-style-guide.es.json
    │   └── my-component-readme.md
    ├── models/
    │   └── my-component.model.ts
    ├── providers/                            (optional) if the component needs environment providers
    │   └── my-component.providers.ts
    ├── services/                             (optional) if logic is extracted to a service
    │   └── my-component.service.ts
    ├── my-component.component.ts
    ├── my-component.component.html
    ├── my-component.component.css            (optional) if there are custom styles
    ├── my-component.component.spec.ts
    └── public-api.ts
```

### When to include each optional folder

| Folder        | Include when...                                                                   |
| ------------- | --------------------------------------------------------------------------------- |
| `assets/`     | The component has translatable text                                               |
| `components/` | There are sub-components used only within this module                             |
| `providers/`  | Third-party providers need to be registered in the environment (`modal`, `toast`) |
| `services/`   | Business logic or state is extracted from the component                           |

---

## Step-by-step implementation

### 1. Model (`models/my-component.model.ts`)

Always use the **class + Parameters interface** pattern:

```typescript
export interface MyComponentConfigParameters {
    items: MyComponentItem[];
    maxItems?: number;
    onItemClick?: (id: number) => void;
}

export class MyComponentConfig {
    items: MyComponentItem[];
    maxItems: number;
    onItemClick?: (id: number) => void;

    constructor({ items, maxItems = 10, onItemClick }: MyComponentConfigParameters) {
        this.items = items;
        this.maxItems = maxItems;
        this.onItemClick = onItemClick;
    }
}

export class MyComponentItem {
    id: number;
    label: string;
    isDisabled: boolean;

    constructor({ id, label, isDisabled = false }: MyComponentItemParameters) {
        this.id = id;
        this.label = label;
        this.isDisabled = isDisabled;
    }
}

export interface MyComponentItemParameters {
    id: number;
    label: string;
    isDisabled?: boolean;
}
```

### 2. Component (`my-component.component.ts`)

Mandatory rules:

-   `standalone: true` always
-   `@Input({ required: true })` for `config`
-   Dependency injection with `inject()`, never in the constructor
-   `ChangeDetectionStrategy.OnPush` for layout or container components
-   Cleanup with `destroy$` if there are subscriptions

```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MyComponentConfig } from './models/my-component.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-my-component',
    standalone: true,
    styleUrls: ['./my-component.component.css'],
    templateUrl: './my-component.component.html'
})
export class MyComponentComponent implements OnInit, OnDestroy {
    private _config!: MyComponentConfig;

    @Input({ required: true })
    set config(value: MyComponentConfig) {
        this._config = value;
        this.onConfigChange();
    }

    get config(): MyComponentConfig {
        return this._config;
    }

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        // initialization
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private onConfigChange(): void {
        // logic on input change
        this.cdr.markForCheck();
    }
}
```

### 3. CSS (`my-component.component.css`)

If the component has its own styles, follow the conventions in [css-styles.md](./css-styles.md). The base structure is always:

```css
:host {
    --bey-my-component-bg: #ffffff;
    --bey-my-component-fg: #0a0a0a;
    --bey-my-component-border: #e7e7e5;
}

:host-context(body.dark) {
    --bey-my-component-bg: #0a0a0a;
    --bey-my-component-fg: #f5f5f3;
    --bey-my-component-border: #232322;
}

.bey-my-component {
    background: var(--bey-my-component-bg);
    color: var(--bey-my-component-fg);
    border: 1px solid var(--bey-my-component-border);
}
```

-   Color variables are declared in `:host` (light values) and overridden in `:host-context(body.dark)` (dark values).
-   Custom classes use the `bey-` prefix and follow the `component__part--modifier` structure.
-   Never use literal color values in rules; always use `var(--bey-*)`.
-   Check the reference palette in [css-styles.md](./css-styles.md) before defining new values.

### 4. i18n (`assets/my-component.en.json` and `.es.json`)

```json
{
    "angular-components": {
        "my-component": {
            "placeholder": "Search...",
            "empty": "No results found"
        }
    }
}
```

Translation keys use the prefix `angular-components.my-component.*`.

### 5. Public API (`public-api.ts`)

Export everything with the `Bey` prefix to avoid name collisions:

```typescript
export { MyComponentComponent as BeyMyComponentComponent } from './my-component.component';
export {
    MyComponentConfig as BeyMyComponentConfig,
    MyComponentItem as BeyMyComponentItem
} from './models/my-component.model';
// Export the service if it exists
// export { MyComponentService as BeyMyComponentService } from './services/my-component.service';
// Do not export the MyComponentParameters interface
```

### 6. Register in the global Public API (`src/public-api.ts`)

Add the line at the end of the exports block:

```typescript
export * from './lib/components/my-component/public-api';
```

---

## Naming conventions

| Element          | Pattern                     | Example                       |
| ---------------- | --------------------------- | ----------------------------- |
| Selector         | `bey-{name}`                | `bey-my-component`            |
| Component class  | `{Name}Component`           | `MyComponentComponent`        |
| Public export    | `Bey{Name}Component`        | `BeyMyComponentComponent`     |
| Config class     | `{Name}Config`              | `MyComponentConfig`           |
| Params interface | `{Name}ConfigParameters`    | `MyComponentConfigParameters` |
| Service          | `{Name}Service`             | `MyComponentService`          |
| Provider fn      | `provideBey{Name}`          | `provideBeyMyComponent`       |
| Folder           | `{name-kebab}`              | `my-component`                |
| Files            | `{name-kebab}.component.ts` | `my-component.component.ts`   |

---

## Checklist before publishing a component

-   [ ] All files use `standalone: true`
-   [ ] `@Input() config` uses a setter and `{ required: true }`
-   [ ] All subscriptions have `takeUntil(this.destroy$)`
-   [ ] `ngOnDestroy` calls `destroy$.next()` and `destroy$.complete()`
-   [ ] `public-api.ts` exports everything with the `Bey` prefix
-   [ ] `src/public-api.ts` includes the re-export of the new component
-   [ ] i18n assets created (`en.json` and `es.json`)
-   [ ] Spec created alongside the component (`.spec.ts`)
-   [ ] CSS follows the conventions in [css-styles.md](./css-styles.md): `--bey-*` variables, `bey-` prefixed classes, no literal colors
-   [ ] If the component has its own colors, the `:host-context(body.dark)` block is defined
-   [ ] Style guide created in `docs/style-guide/`
-   [ ] Readme `my-component-readme.md` created in `docs/`
-   [ ] `my-component-style-guide` component added to the library's `style-guide` component
