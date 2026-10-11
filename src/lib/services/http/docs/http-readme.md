# Http

`BeyHttpService` wraps `HttpClient` for the calls of an app. Each method returns a cold, typed `Observable`: the
request leaves when something subscribes, can show the loading overlay and confirm a success with a toast, and an
error opens the error modal with the server's reason unless the request handles it, and then reaches the
subscriber. `provideBeyApp` registers everything it needs.

## Usage

```ts
private readonly http = inject(BeyHttpService);

save(contact: Contact): void {
    this.http
        .post<Contact>('/api/contacts', contact, { loading: true, successToast: 'myApp.contacts.saved' })
        .subscribe(saved => this.contacts.update(contacts => [...contacts, saved]));
}
```

## BeyHttpService

| Method                          | Meaning                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `get(url, options?)`            | `GET`, the body read as JSON                                  |
| `getBlob(url, options?)`        | `GET`, the body read as a `Blob`                              |
| `post(url, body, options?)`     | `POST`                                                        |
| `postBlob(url, body, options?)` | `POST`, the response read as a `Blob`                         |
| `put(url, body, options?)`      | `PUT`                                                         |
| `patch(url, body, options?)`    | `PATCH`                                                       |
| `delete(url, body, options?)`   | `DELETE` with a body                                          |
| `upload(url, bytes, options?)`  | `PUT` of an `ArrayBuffer` or a `Blob`, reporting its progress |

## BeyHttpRequestOptions

| Field             | Default | Meaning                                                                |
| ----------------- | ------- | ---------------------------------------------------------------------- |
| `headers`         | none    | Headers sent with the request                                          |
| `queryParams`     | none    | The query string; an array repeats the parameter once per value        |
| `loading`         | `false` | Shows the loading overlay from the subscription until the request ends |
| `successToast`    | none    | i18n key of a success toast shown when the request succeeds            |
| `handleError`     |         | Called with the `HttpErrorResponse` instead of opening the error modal |
| `withCredentials` | `false` | Sends the cookies with a request to another origin, and keeps its own  |

`BeyUploadRequestOptions` adds `onProgress`, called with the fraction sent so far, from `0` to `1`.

`withCredentials` reaches `HttpClient` from every method. A request to the origin the app is served from carries its
cookies anyway; the option is for an api on another origin, which then has to allow the app's origin with
credentials. The sign-in, the registration and the session send it, so the refresh cookie travels in both setups.

## Sending and subscribing

Nothing is sent until something subscribes, and each subscription sends its own request: a result used twice is
subscribed once and shared by the caller. Unsubscribing before the answer cancels the request and hides the
overlay, so a `switchMap` over the requests keeps only the newest one.

A failed request opens the error modal, or runs `handleError`, and then errors with the same `HttpErrorResponse`,
so the subscriber decides what else happens (`error` callback, `catchError`). A subscriber that does not handle it
stays quiet: `provideBeyHttp`, part of `provideBeyApp` and `provideBeyTesting`, keeps rxjs from reporting an error
the service already showed, and leaves every other unhandled error to the previous `onUnhandledError` of rxjs or to
its default. An app that does not use `provideBeyApp` adds `provideBeyHttp()` to its providers.

The reason the modal shows comes from the error body express-components sends,
`{ errorCode, messageKey, messageParameters, details, timestamp }`: `angular-components.http.error.<messageKey>`
when the body names one, the text of its `errorCode` otherwise, and the unknown error when neither is translated.
Besides the text of every `errorCode`, the service ships those of the `messageKey`s no module of the library owns,
such as `attachments.*` and `entities.owner-required`; a module ships the texts of its own, such as `users.*`.
A string among the `messageParameters` is replaced by `angular-components.http.field.<value>` when that key is
translated; any other value is shown as it is, such as the `minutes` of `login.account-locked`.
A failed `getBlob` or `postBlob` answers that body as a `Blob`; the service reads it as JSON first, so a download shows
the reason too, and the unknown error only when the body is not JSON.
`details` stays on the `HttpErrorResponse` for a `handleError` or a subscriber that shows it.
