# Edit lock

`BeyEditLockService` keeps one editor at a time on a row, over the edit locks of the base-entity module of
express-components (`GET`, `POST` and `DELETE {base}/:id/lock`). A component that edits a row provides it, starts it
with the url of the lock of that row, and stays editable only while the window holds the lock; everybody else who opens
the row sees it read-only, with [`bey-edit-lock-notice`](../../../components/edit-lock-notice/docs/edit-lock-notice-readme.md)
saying who edits it and since when. The holder is the window, not the user: each instance draws a random token at
creation, keeps it for its whole life, and sends it with every request, so the same user in a second window waits like
anybody else and can take the lock over from there.

## Usage

```ts
@Component({
    providers: [BeyEditLockService],
    selector: 'my-item-editor',
    templateUrl: './item-editor.component.html'
})
export class ItemEditorComponent {
    private readonly editLock = inject(BeyEditLockService);
    private readonly http = inject(BeyHttpService);

    readonly isReadOnly = computed(() => this.editLock.state().status !== 'own');
    readonly notice = new BeyEditLockNoticeConfig({ prefix: 'my-app.item-editor.edit-lock' });

    open(id: string): void {
        this.editLock.start(`${API_URL}/items/${id}/lock`);
    }

    save(item: Item): void {
        this.http.put(`${API_URL}/items/${item.id}`, item, { headers: this.editLock.headers() }).subscribe();
    }
}
```

```html
<bey-header [config]="header()" />
<bey-edit-lock-notice [config]="notice" />
<my-item-form [isReadOnly]="isReadOnly()" />
```

## BeyEditLockService

| Member           | Meaning                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `state`          | A signal of `{ lock, status }`, the `BeyEditLockState`                                        |
| `token`          | The token of the window                                                                       |
| `headers()`      | `{ 'X-Edit-Lock-Token': token }`, for the request that saves what the lock protects           |
| `start(lockUrl)` | Acquires the lock of the row at that url; another url releases the lock of the previous one   |
| `acquire()`      | Asks for the lock again, after `free` or to retry; whoever calls it reloads the row first     |
| `takeOver()`     | Moves the lock to this window when another window of the same user holds it                   |
| `release()`      | Gives up the lock the window holds, and keeps watching it as `free`                           |
| `releaseOther()` | Releases a lock somebody else holds, for whom the server allows it; then the status is `free` |

`lockUrl` is the whole url, as `BeyHttpService` takes it: the base url of the api and the path of the resource, such as
`https://api.example.com/api/templates/t1/lock`. The service is provided by the component that edits, never in root:
its life is the life of that component.

## BeyEditLockStatus

| Status        | Meaning                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| `acquiring`   | Before the first answer, and while `acquire()` or `takeOver()` wait for theirs   |
| `own`         | The window holds the lock: the editor is editable                                |
| `held`        | Somebody else holds it, a colleague or another window of the same user           |
| `lost`        | The window held it and does not any more: released, or taken over                |
| `free`        | Nobody holds it; the service does not take it on its own                         |
| `unavailable` | The row is out of reach, or the user may no longer edit it; nothing more is sent |

`lock` is the `BeyEditLock` the server answers, `null` while nobody holds it and after a release:

| Field        | Meaning                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `holderId`   | The user who holds it                                                                          |
| `holderName` | Their name and surname, or their email; `null` when the server no longer resolves the holder   |
| `acquiredAt` | When their editing started, in milliseconds                                                    |
| `expiresAt`  | When it expires unless a heartbeat comes first                                                 |
| `isOwn`      | This window holds it                                                                           |
| `isSameUser` | The user of the session holds it, maybe in another window                                      |
| `canRelease` | The user may release it: the same user, a manager of the organization of the row, a superadmin |

## Heartbeats and polling

Once started, the service sends a request every quarter of the `lifetimeMs` the server answers, two minutes unless it
says otherwise: a `POST` with the token while it holds the lock, which keeps it alive, and a `GET ?token=` while it does
not. `takeOver()` sends that `POST` with `isTakeOver: true`, which the server honours only while the same user holds the
lock. A lock the window stops refreshing, a closed tab or a crash, expires on the server once its lifetime goes by.

-   **Holding**: a heartbeat that answers somebody else turns the status `lost`, and so does one that answers no lock at
    all: a manager or a superadmin released it, and the server keeps that heartbeat from taking it back. Should a
    heartbeat answer the window again but with a new `acquiredAt`, the lock was taken back from scratch after a release
    or a sweep: the service releases it at once and reports it lost too, since whoever released it may have changed the
    row. A lost lock is never acquired again on its own.
-   **Waiting** (`held`, `lost`, `free`): the poll follows the holder, and turns `held` or `lost` into `free` once nobody
    holds it. The service never acquires on its own: the editor reloads the row first, then calls `acquire()`.
-   **Failures**: a `404` on any request turns the status `unavailable` and stops everything: the row is gone, or the user
    cannot see it. So does an acquire or a heartbeat refused with `403` (the user lacks the action that edits it) or with
    any `409`, such as `action-unavailable` (the row no longer offers it, a template locked meanwhile): the editor stays
    read-only, with its changes on screen. Any other failure, a network one among them, keeps the status and is tried
    again on the next tick. A tick waits while the previous request is on its way, and `acquire()`, `takeOver()`,
    `release()` and `releaseOther()` cancel it.
-   **No error modals**: the requests the service sends on its own handle their errors. Only `releaseOther()`, which the
    user asks for, shows the reason of a refusal in the error modal, such as `edit-locks.release-forbidden`.

The timer runs outside the Angular zone, so a page that holds a lock still becomes stable.

## Leaving

When the component that provides the service is destroyed, the service stops and releases the lock it holds with a
`DELETE ?token=`. On `pagehide` (closing the tab, reloading, leaving the app) it sends the same release with
`fetch(..., { keepalive: true })`, which outlives the page and carries the session token as `Authorization: Bearer`,
something `sendBeacon` cannot do; the status becomes `free` and the timer stops, so a page restored from the browser's
back-forward cache shows the lock as free and acquires it again from the notice. When the api is on another origin, the
keepalive request needs a preflight, which some browsers do not send for it; the lock then expires on its own.

## Saving

The product's route that saves what the lock protects runs the guard of express-components, which reads the token from
`X-Edit-Lock-Token`. Nothing sends it implicitly: the product adds `headers()` to that save, and to nothing else. A save
refused while somebody else holds the lock fails with `409 edit-locks.held`, the holder as `holderName`, and one sent
after a manager or a superadmin released the lock fails with `409 edit-locks.released`; the error modal shows either,
and the next heartbeat reports the lock lost.

Saving the changes of a lost lock as a copy creates another row, which nobody holds: its save goes without `headers()`,
so the guard lets it through without acquiring the lock of the copy for a window that does not edit it.

## Texts

| Key                                                          | Shown as                                         |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `angular-components.http.error.edit-locks.held`              | A save refused while somebody else edits the row |
| `angular-components.http.error.edit-locks.released`          | A save sent after the lock was released          |
| `angular-components.http.error.edit-locks.release-forbidden` | A release the user may not do                    |

Each has its title under `angular-components.http.title.edit-locks.*`.
