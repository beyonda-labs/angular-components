# Notice

A compact banner across the width of its container: an icon, a translated message and, after it, the buttons of its
actions. The variant sets its colour and its default icon, and how assistive technologies announce it: `Info` and
`Warning` are a polite `role="status"`, `Danger` a `role="alert"`. It suits what a page must say about itself while
the user stays on it, such as [`bey-edit-lock-notice`](../../edit-lock-notice/docs/edit-lock-notice-readme.md) between
the header and the body of an editor.

## Usage

```ts
readonly notice = new BeyNoticeConfig({
    actions: [
        new BeyNoticeAction({
            action: () => this.reload(),
            key: 'reload',
            label: 'my-app.item.reload',
            type: BeyNoticeActionType.Primary
        })
    ],
    message: 'my-app.item.changed',
    messageParameters: { name: 'Grace Hopper' },
    variant: BeyNoticeVariant.Warning
});
```

```html
<bey-notice [config]="notice" />
```

## BeyNoticeConfig

| Field               | Required | Default    | Meaning                                                                            |
| ------------------- | -------- | ---------- | ---------------------------------------------------------------------------------- |
| `message`           | yes      |            | Translation key of the text                                                        |
| `messageParameters` | no       | none       | The parameters the text interpolates                                               |
| `variant`           | no       | `Info`     | `Info`, `Warning` or `Danger`, from `BeyNoticeVariant`                             |
| `icon`              | no       | by variant | A FontAwesome icon; the variant gives a circled `i`, a triangle or a circled cross |
| `actions`           | no       | `[]`       | The `BeyNoticeAction`s, rendered as buttons in their order                         |

## BeyNoticeAction

| Field    | Required | Default     | Meaning                                              |
| -------- | -------- | ----------- | ---------------------------------------------------- |
| `key`    | yes      |             | Identifies the action among the others               |
| `label`  | yes      |             | Translation key of the button                        |
| `action` | yes      |             | Run when the button is used                          |
| `type`   | no       | `Secondary` | `Primary` or `Secondary`, from `BeyNoticeActionType` |

The config is replaced, never changed in place: to say something else, bind a new `BeyNoticeConfig`.

## Theming

| Variable            | Default                                          |
| ------------------- | ------------------------------------------------ |
| `--bey-notice-tint` | `10%` of the colour of the variant in the fill   |
| `--bey-notice-edge` | `35%` of the colour of the variant in the border |

The colour of the variant is `--bey-blue` for `Info`, `--bey-warning` for `Warning` and `--bey-danger` for `Danger`,
mixed over `--bey-bg-page`, so the notice reads in both themes.
