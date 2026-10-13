# Notifications

The notifications centre over the `notifications` module of express-components: a bell with the unread count as a
badge, which opens a panel with the notices of the signed-in user, newest first. `BeyNotificationsService` asks the
server for news while a session is open; there is no server push. An app turns the centre on with `notifications` on
`BeyAppLayoutConfig`, which puts the bell at the foot of the menu; an app without it sees nothing and sends nothing.

## Usage

```ts
readonly layout = new BeyAppLayoutConfig({
    // ...
    notifications: new BeyNotificationsConfig({
        entityLabels: { templates: 'my-app.entities.templates' },
        labels: { 'templates.review-requested': 'my-app.notifications.review-requested' },
        link: ({ target }) => (target?.entity === 'templates' && target.id ? `/templates/${target.id}` : null)
    })
});
```

`bey-notifications` can also sit anywhere else, such as a header of the app's own:

```html
<bey-notifications [config]="notifications" />
```

## BeyNotificationsConfig

| Field            | Default            | Meaning                                                                            |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `baseUrl`        | `'/notifications'` | Path of the routes, after the `baseUrl` and `webApiPath` of the environment        |
| `pollIntervalMs` | `60000`            | How often the unread count is asked while a session is open                        |
| `pageSize`       | `20`               | How many notices each page of the panel asks for, 50 at most on the server         |
| `labels`         | `{}`               | The i18n key of the text of each type of the app, `type → key`                     |
| `entityLabels`   | `{}`               | The i18n key of each entity named in the parameters, `entity → key`                |
| `link`           | none               | The route a notice opens, or `null` to only mark it read                           |

## BeyNotification

What the server answers for each notice: `id`, `type`, `createdAt` and `readAt` (epoch milliseconds, `readAt` `null`
while unread), `parameters` for its text, and `target` (`{ entity, id }` or `null`), what it is about, which `link`
turns into a route. `BeyNotificationTarget` and `BeyNotificationsPage` are typed as well, and `BeyNotificationType`
names the three types of the library:

| `BeyNotificationType` | `type`                      | `parameters`                                |
| --------------------- | --------------------------- | ------------------------------------------- |
| `FolderShared`        | `sharing.folder-shared`     | `entity`, `folderName`, `access`, `byName`  |
| `EditLockReleased`    | `edit-locks.released`       | `entity`, `rowName`, `byName`               |
| `ContentTransferred`  | `users.content-transferred` | `fromName`, `byName`, `count`               |

## BeyNotificationsService

A root singleton, which `bey-notifications` starts with its config and stops when it is destroyed. A page may read it
or call it as well.

| Member          | Meaning                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| `unreadCount`   | Signal with the unread count, `0` while stopped or signed out                              |
| `notifications` | Signal with the notices loaded, newest first                                               |
| `hasMore`       | Signal, `true` while older notices are left to load                                        |
| `isLoading`     | Signal, `true` while a page is on its way                                                  |
| `refresh()`     | Asks the unread count at once                                                              |
| `load(isMore)`  | Loads the newest page, or with `true` the page older than the last notice loaded           |
| `markRead(id)`  | Marks one notice read, once, and counts one less                                           |
| `markAllRead()` | Marks every notice of the user read                                                        |
| `start(config)` | Starts asking with that config; `bey-notifications` calls it                               |
| `stop()`        | Stops asking and forgets what it held                                                      |

## When it asks

-   **Every `pollIntervalMs`**, and once as soon as it starts, while a session is open.
-   **After a navigation**: a burst of navigations within 300 ms makes one call.
-   **On sign-out** it stops, and forgets the count and the notices; it starts again on the next sign-in.

Those calls only ask the unread count, and a failed one shows no error modal: the next one tries again. The panel
loads its first page each time it opens and from its refresh button, and the next ones from "Show more"; those are the
user's own requests, so a failure there shows the error modal as any request of the HTTP service does.

## The panel

The bell is named "Notifications", or "Notifications, 3 unread" while there are unread notices, and the badge shows the
count, `99+` above 99. It opens the panel as a dialog named by its title and takes the focus into it. Escape, a click
outside it or the bell again close it, and Escape gives the focus back to the bell.

Each notice is a button with its text, how long ago it came, and an unread mark, read out as "Unread". Opening one
marks it read and, when `link` gives a route, navigates there and closes the panel. "Mark all as read" is disabled
while nothing is unread, and "Show more" shows while `hasMore`. With no notices the panel says so.

The time reads "Just now", "5 min ago", "3 h ago" or "2 d ago" ("Ahora mismo", "hace 5 min"… in Spanish) for the last
week, and the date in the language in use before that.

## Texts

The text of a notice is the key of its type translated with its parameters, resolved first:

-   a type in `labels` takes that key, a type of the library takes `angular-components.notifications.types.<type>`,
    and any other type the generic `angular-components.notifications.unknown-type`, "You have a new notification";
-   an `entity` in `entityLabels` is translated with that key, and any other shows its raw name;
-   an `access` of `read` or `write` reads "read only" or "read and write";
-   a `null` parameter, a name nobody kept, reads "Unknown" (`angular-components.user-name.unknown`), and a number reads
    as it is.

| Key                                               | Shown as                                                   |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `angular-components.notifications.types.<type>`   | The text of each type of the library, with its parameters  |
| `angular-components.notifications.unknown-type`   | The text of a type nobody labels                           |
| `angular-components.notifications.access.<value>` | `read` and `write`                                         |
| `angular-components.notifications.bell.label`     | The name of the bell, and `.unread` with `{{count}}`       |
| `angular-components.notifications.time.<unit>`    | `now`, and `minutes`, `hours` and `days` with `{{count}}`  |
| `angular-components.notifications.actions.<key>`  | `refresh`, `mark-all-read` and `show-more`                 |
| `angular-components.notifications.title`          | The title of the panel                                     |
| `angular-components.notifications.empty`          | The panel without notices                                  |
| `angular-components.notifications.loading`        | The panel while its first page loads                       |
| `angular-components.notifications.unread`         | What an unread notice is read out with                     |

The module also writes the text of the `notifications.not-found` error of the server, a notice opened after it was
purged.

## Theming

| Variable                          | Default              |
| --------------------------------- | -------------------- |
| `--bey-notifications-accent`      | `--bey-primary`      |
| `--bey-notifications-badge-bg`    | `--bey-danger`       |
| `--bey-notifications-badge-fg`    | `--bey-danger-fg`    |
| `--bey-notifications-border`      | `--bey-border-subtle`|
| `--bey-notifications-surface`     | `--bey-bg-surface`   |
| `--bey-notifications-text`        | `--bey-text-primary` |
| `--bey-notifications-text-muted`  | `--bey-text-muted`   |
| `--bey-notifications-unread-bg`   | `--bey-primary-soft` |
