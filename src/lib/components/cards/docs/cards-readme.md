# Cards

The pieces of a summary page, each driven by its own config: `bey-card`, a surface with an optional title and count
over whatever it holds; `bey-card-stats`, a strip of figures divided by rules; `bey-card-list`, a titled list of
items, each with an avatar or an icon, a title, a subtitle and either a fold that shows more items in place or a
chevron that opens it; and `bey-avatar`, the round initials of a person, which the left menu shows for the user of the
session too. Every text goes through the translate pipe, so a translation key or a plain text, such as a name, both
work. They know nothing of any domain;
[`bey-organization-summary`](../../administration/organization-summary/docs/organization-summary-readme.md) is built
with them.

## Usage

```ts
readonly overview = new BeyCardConfig();
readonly figures = new BeyCardStatsConfig({
    items: [new BeyCardStat({ icon: faUser, key: 'people', label: 'myApp.people', value: 4 })]
});
readonly teams = new BeyCardListConfig({
    count: 1,
    title: 'myApp.teams.title',
    items: [
        new BeyCardListItem({
            icon: faUsers,
            key: 'sales',
            subtitle: 'myApp.teams.members',
            subtitleParameters: { count: 1 },
            title: 'Sales',
            fold: new BeyCardListFold({
                items: [
                    new BeyCardListItem({
                        avatar: new BeyAvatarConfig({ name: 'Ada', surname: 'Lovelace', variant: BeyAvatarVariant.Soft }),
                        key: 'ada',
                        subtitle: 'ada@example.test',
                        title: 'Ada Lovelace'
                    })
                ]
            })
        })
    ]
});
```

```html
<bey-card [config]="overview">
    <bey-card-stats [config]="figures"></bey-card-stats>
    <bey-card-list [config]="teams"></bey-card-list>
</bey-card>
```

## BeyCardConfig

| Field   | Default | Meaning                                                        |
| ------- | ------- | -------------------------------------------------------------- |
| `title` | none    | Heading of the card (`h2`), which then names its `section`     |
| `count` | none    | A pill next to the title; shown only with a title and a number |

The card projects its content under the heading, one block under another.

## BeyCardStatsConfig and BeyCardStat

| Field   | Required | Meaning                                                                       |
| ------- | -------- | ----------------------------------------------------------------------------- |
| `items` | yes      | The figures, in order, one cell each                                          |
| `key`   | yes      | Identifies the figure                                                         |
| `value` | yes      | The number, in bold                                                           |
| `label` | yes      | Text after the number, translated with `{ count: value }` for a plural choice |
| `icon`  | no       | FontAwesome icon before the number                                            |

On a narrow screen the cells stack, divided by horizontal rules.

## BeyCardListConfig

| Field        | Required | Default                          | Meaning                                                                |
| ------------ | -------- | -------------------------------- | ---------------------------------------------------------------------- |
| `items`      | yes      |                                  | The `BeyCardListItem`s, in order                                       |
| `title`      | no       | none                             | Heading of the list (`h3`), which then names its `section`             |
| `count`      | no       | none                             | A pill next to the title, independent of how many items show           |
| `emptyLabel` | no       | `angular-components.cards.empty` | Shown instead of the items when there is none                          |
| `variant`    | no       | `BeyCardListVariant.Grouped`     | `Grouped`: one box, items divided by rules; `Separate`: a box per item |

## BeyCardListItem

| Field                | Required | Meaning                                                                                          |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `key`                | yes      | Identifies the item                                                                              |
| `title`              | yes      | The first line, in bold                                                                          |
| `subtitle`           | no       | The second line, muted, translated with `subtitleParameters`; a row without one keeps its height |
| `subtitleParameters` | no       | The parameters the subtitle interpolates, such as `{ count: 2 }`                                 |
| `avatar`             | no       | A `BeyAvatarConfig` before the texts; takes the place of `icon`                                  |
| `icon`               | no       | FontAwesome icon before the texts, as wide as an avatar so the titles line up                    |
| `onClick`            | no       | Makes the item a button with a chevron, named by its title and described by its subtitle         |
| `fold`               | no       | A `BeyCardListFold`: a link-styled toggle on the right that shows more items in place            |

An item with both `onClick` and `fold` keeps the button and shows the toggle instead of the chevron.

## BeyCardListFold

| Field        | Required | Default                              | Meaning                                        |
| ------------ | -------- | ------------------------------------ | ---------------------------------------------- |
| `items`      | yes      |                                      | The `BeyCardListItem`s it shows once open      |
| `showLabel`  | no       | `angular-components.cards.fold.show` | Text of the toggle while folded                |
| `hideLabel`  | no       | `angular-components.cards.fold.hide` | Text of the toggle while open                  |
| `emptyLabel` | no       | `angular-components.cards.empty`     | Shown once open when it holds no items         |
| `isOpen`     | no       | `false`                              | Whether it starts open; the item owns it after |

The toggle is a button with `aria-expanded`, described by the title of its item and, while open, controlling the list
it shows, which that title names.

## BeyAvatarConfig

| Field      | Required | Default                   | Meaning                                                    |
| ---------- | -------- | ------------------------- | ---------------------------------------------------------- |
| `name`     | yes      |                           | Its first letter, in capitals, is the first initial        |
| `surname`  | no       | none                      | Its first letter is the second initial                     |
| `initials` | no       | from the name and surname | The text of the avatar instead                             |
| `variant`  | no       | `BeyAvatarVariant.Solid`  | `Solid`: the primary colour; `Soft`: the active background |

The avatar is hidden from assistive technology: the name always goes next to it, or names the element around it.

## Texts

`angular-components.cards.empty`, `.fold.show` and `.fold.hide`, in English and Spanish.

## Theming

| Variable                           | Set on                      | Default                                                     |
| ---------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `--bey-cards-card-bg`              | `bey-card`                  | `--bey-bg-surface`                                          |
| `--bey-cards-card-border`          | `bey-card`                  | `--bey-border-subtle`                                       |
| `--bey-cards-card-padding`         | `bey-card`                  | `--bey-space-xl`                                            |
| `--bey-cards-count-bg`             | `bey-card`, `bey-card-list` | `--bey-bg-active`                                           |
| `--bey-cards-count-fg`             | `bey-card`, `bey-card-list` | `--bey-text-secondary`                                      |
| `--bey-cards-stats-bg`             | `bey-card-stats`            | `--bey-bg-page`                                             |
| `--bey-cards-stats-border`         | `bey-card-stats`            | `--bey-border-subtle`                                       |
| `--bey-cards-stats-icon`           | `bey-card-stats`            | `--bey-text-secondary`                                      |
| `--bey-cards-list-bg`              | `bey-card-list`             | `--bey-bg-page`                                             |
| `--bey-cards-list-border`          | `bey-card-list`             | `--bey-border-subtle`, also the fold's rules                |
| `--bey-cards-list-empty`           | `bey-card-list`             | `--bey-text-muted`                                          |
| `--bey-cards-list-item-hover`      | `bey-card-list`             | `--bey-bg-hover`, a clickable item                          |
| `--bey-cards-list-item-icon`       | `bey-card-list`             | `--bey-text-secondary`                                      |
| `--bey-cards-list-item-link`       | `bey-card-list`             | `--bey-text-link`, the toggle of a fold                     |
| `--bey-cards-list-item-link-hover` | `bey-card-list`             | `--bey-text-link-hover`                                     |
| `--bey-cards-list-item-muted`      | `bey-card-list`             | `--bey-text-muted`, the subtitle                            |
| `--bey-cards-avatar-bg`            | `bey-avatar` or an ancestor | `--bey-primary` (`Solid`), `--bey-bg-active` (`Soft`)       |
| `--bey-cards-avatar-fg`            | `bey-avatar` or an ancestor | `--bey-primary-fg` (`Solid`), `--bey-text-primary` (`Soft`) |
| `--bey-cards-avatar-size`          | `bey-avatar`                | `--bey-space-2xl` plus `--bey-space-sm`                     |
| `--bey-cards-avatar-font-size`     | `bey-avatar`                | `--bey-font-size-sm`                                        |

Each public element declares the variables of its piece on its own host, so they are set on that element with the
specificity [tokens.md](../../../../../docs/tokens.md) shows, such as `:root bey-card-list`: the count of a title
reads them from its card or its list, and every item of a list, folded ones too, from the list. The colours of an
avatar are declared nowhere: set on `bey-avatar`, on any ancestor or on `:root`, they paint both variants, which
otherwise keep the defaults above. The dark theme comes from the tokens.
