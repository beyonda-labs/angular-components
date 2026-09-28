# Http

`BeyHttpService` wraps `HttpClient` for the calls of an app. Each request can show the loading overlay, confirm
a success with a toast and report its result through callbacks, and an error opens the error modal with the
server's reason unless the request handles it. `provideBeyApp` registers everything it needs.

## Usage

```ts
private readonly http = inject(BeyHttpService);

save(contact: Contact): void {
    this.http.post<Contact>('/api/contacts', contact, {
        loading: true,
        successToast: 'myApp.contacts.saved',
        onSuccess: saved => this.contacts.update(contacts => [...contacts, saved as Contact])
    });
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
| `loading`      | `false` | Shows the loading overlay until the request ends                       |
| `successToast` | none    | i18n key of a success toast shown when the request succeeds            |
| `onSuccess`    |         | Called with the response body                                          |
| `handleError`  |         | Called with the `HttpErrorResponse` instead of opening the error modal |
| `onError`      |         | Called with the `HttpErrorResponse` after the modal or `handleError`   |

`BeyUploadRequestOptions` adds `onProgress`, called with the fraction sent so far, from `0` to `1`.

## Sending and subscribing

The request goes out when the method is called, whether anything subscribes to what it returns or not: the
overlay, the toast, the callbacks and the error modal never wait for a subscriber. Subscribing, once or several
times, shares that same request and its result instead of sending it again. After an error the returned
observable completes without emitting and without an error, so whatever reacts to a failure goes in `onError`.
