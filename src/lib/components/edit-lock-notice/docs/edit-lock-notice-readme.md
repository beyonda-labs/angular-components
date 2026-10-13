# Edit lock notice

What an editor says about its [edit lock](../../../services/edit-lock/docs/edit-lock-readme.md): a
[`bey-notice`](../../notice/docs/notice-readme.md) built from the state of the `BeyEditLockService` the editing
component provides, so the notice must sit inside that component's template, usually between the header and the body.
It shows nothing while the window acquires the lock or holds it, and otherwise says why the editor is read-only and
offers what can be done about it.

## Usage

```ts
readonly notice = computed(
    () =>
        new BeyEditLockNoticeConfig({
            onEdit: claim => this.reload(claim),
            onSaveCopy: this.hasChanges() ? () => this.saveCopy() : undefined,
            prefix: 'my-app.item-editor.edit-lock'
        })
);
```

```html
<bey-header [config]="header()" />
<bey-edit-lock-notice [config]="notice()" />
<my-item-form [isReadOnly]="isReadOnly()" />
```

## BeyEditLockNoticeConfig

| Field        | Default                                 | Meaning                                                                                                |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `prefix`     | `'angular-components.edit-lock-notice'` | i18n prefix every text of the notice resolves from                                                     |
| `onEdit`     | none                                    | Run by Edit and Edit here with a `claim` to call once the row is reloaded                              |
| `onSaveCopy` | none                                    | Offered as Save as a copy while the lock is lost or free; give it only while there are unsaved changes |

## What it shows

| Status                                | Variant   | Message                                  | Actions                                       |
| ------------------------------------- | --------- | ---------------------------------------- | --------------------------------------------- |
| `acquiring`, `own`                    |           | nothing                                  |                                               |
| `held` by somebody else, since today  | `Warning` | `messages.held.today`, `name` and `time` | Release, only when the lock says `canRelease` |
| `held` by somebody else, before today | `Warning` | `messages.held.earlier`, with its `date` | The same                                      |
| `held` by another window of the user  | `Info`    | `messages.other-window`                  | Edit here, which takes the lock over          |
| `lost`, released                      | `Danger`  | `messages.lost.released`                 | Save as a copy, with `onSaveCopy`             |
| `lost`, taken by somebody else        | `Danger`  | `messages.lost.taken`, with its `name`   | The same                                      |
| `lost` to another window of the user  | `Danger`  | `messages.lost.other-window`             | The same                                      |
| `free`                                | `Info`    | `messages.free`                          | Edit, and Save as a copy with `onSaveCopy`    |
| `unavailable`                         | `Danger`  | `messages.unavailable`                   | none                                          |

The time and the date follow the language in use: `9:05 AM` and `Oct 11, 2026` in English, `9:05` and `11 oct 2026` in
Spanish. A `name` is the `holderName` of the lock, or "Unknown"
(`angular-components.user-name.unknown`, "Desconocido" in Spanish) when the server answers it `null`.

## The actions

-   **Edit** and **Edit here** take the lock, with `acquire()` and `takeOver()`. The row on screen may be older than what
    the holder saved, so with `onEdit` the notice hands the product a `claim` instead: the product reloads the row, puts
    it on screen, and then calls `claim()`. Without `onEdit` the notice claims the lock at once, which only suits a row
    nobody else could have changed.
-   **Release** asks first, with the confirmation modal (`release-confirmation.*`, the holder as `name`), and then calls
    `releaseOther()`. The holder's window finds out on its next heartbeat. A product that releases from somewhere else
    calls `releaseOther()` itself, after its own confirmation.
-   **Save as a copy** runs `onSaveCopy`. The window that lost the lock keeps its unsaved changes on screen, and the
    product saves them as a new row, such as a duplicate and then a save of its content, sent without the `headers()` of
    the lock since the copy is another row. The action stays while the status is `lost`, and once it turns `free` as
    well, so the changes can still be kept after the holder leaves; pass `onSaveCopy` only while there are unsaved
    changes, so a viewer who never edited is not offered it.

## Texts

| Key                                                             | Shown as                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `<prefix>.messages.held.today` / `.earlier`                     | `{{name}}`, `{{time}}` and, before today, `{{date}}`         |
| `<prefix>.messages.other-window`                                | The same user edits it in another window                     |
| `<prefix>.messages.lost.released` / `.taken` / `.other-window`  | The window lost the lock; `.taken` names who has it          |
| `<prefix>.messages.free`, `<prefix>.messages.unavailable`       | Free again; no longer available                              |
| `<prefix>.actions.edit`, `.take-over`, `.release`, `.save-copy` | The buttons                                                  |
| `<prefix>.release-confirmation.title`, `.message`, `.confirm`   | The confirmation before a release, `{{name}}` in the message |

The library texts say "it", "lo" in Spanish; a product gives its own prefix to name the row, such as "this template".
