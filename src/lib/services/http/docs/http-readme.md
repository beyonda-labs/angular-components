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

| Method                         | Meaning                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| `get(url, options?)`           | `GET`, the body read as JSON                                  |
| `getBlob(url, options?)`       | `GET`, the body read as a `Blob`                              |
| `post(url, body, options?)`    | `POST`                                                        |
| `put(url, body, options?)`     | `PUT`                                                         |
| `patch(url, body, options?)`   | `PATCH`                                                       |
| `delete(url, body, options?)`  | `DELETE` with a body                                          |
| `upload(url, bytes, options?)` | `PUT` of an `ArrayBuffer` or a `Blob`, reporting its progress |

## BeyHttpRequestOptions

| Field          | Default | Meaning                                                                |
| -------------- | ------- | ---------------------------------------------------------------------- |
| `headers`      | none    | Headers sent with the request                                          |
| `queryParams`  | none    | The query string; an array repeats the parameter once per value        |
| `loading`      | `false` | Shows the loading overlay from the subscription until the request ends |
| `successToast` | none    | i18n key of a success toast shown when the request succeeds            |
| `handleError`  |         | Called with the `HttpErrorResponse` instead of opening the error modal |

`BeyUploadRequestOptions` adds `onProgress`, called with the fraction sent so far, from `0` to `1`.

## Sending and subscribing

Nothing is sent until something subscribes, and each subscription sends its own request: a result used twice is
subscribed once and shared by the caller. Unsubscribing before the answer cancels the request and hides the
overlay, so a `switchMap` over the requests keeps only the newest one.

A failed request opens the error modal, or runs `handleError`, and then errors with the same `HttpErrorResponse`,
so the subscriber decides what else happens (`error` callback, `catchError`). A subscriber that does not handle it
stays quiet: `provideBeyHttp`, part of `provideBeyApp` and `provideBeyTesting`, keeps rxjs from reporting an error
the service already showed, and leaves every other unhandled error to the previous `onUnhandledError` of rxjs or to
its default. An app that does not use `provideBeyApp` adds `provideBeyHttp()` to its providers.
