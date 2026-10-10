# Testing

`@beyonda-labs/angular-components/testing` holds what a consumer's specs need so they never rewrite it: the
generic DOM helpers the library's own specs use, `provideBeyTesting`, the test counterpart of `provideBeyApp`,
and a fake for each service that opens a dialog, shows a toast or writes to the browser. A fake is a plain
injectable that records what it is asked for in signals and answers what the spec set beforehand; whoever injects
the real service gets the fake, and the spec reaches the same instance with `TestBed.inject(BeyFake…)`. Only specs
import this entry point; nothing in it depends on Jest, so `jest.spyOn` on a fake still works.

## Setup

```ts
TestBed.configureTestingModule({
    imports: [ContactsComponent],
    providers: [provideBeyTesting()]
});
```

It replaces `TranslateModule.forRoot()`, `provideHttpClient()` and any hand-written `useValue` of the services
below. Routes stay in the spec, with `provideRouter`.

## provideBeyTesting(config?)

The HTTP client with the session interceptor and then `interceptors`, backed by `provideHttpClientTesting`, so
requests are answered with `HttpTestingController`; `provideBeyHttp`, so a failed request whose error modal the
fake recorded raises nothing in a spec that subscribes without an `error` callback; the environment; the session,
which lives in memory; ngx-translate without a loader; the ngx-bootstrap modals, so the dialogs of the services
without a fake (the tree dialog) open for real; and the fakes.

| Field          | Default                              | Meaning                                                  |
| -------------- | ------------------------------------ | -------------------------------------------------------- |
| `environment`  | `baseUrl` `https://api.test`, `/api` | Fields merged over the test environment                  |
| `interceptors` | `[]`                                 | Run after the session interceptor, as in `provideBeyApp` |
| `session`      | the library's defaults               | A `BeySessionConfig`                                     |
| `user`         | nobody signed in                     | Signs the session in with this user                      |
| `token`        | `test-token` when there is a `user`  | The session token, sent as `Authorization: Bearer`       |
| `translations` | none, so keys render as they are     | Texts per language: `{ en: { greeting: 'Hello' } }`      |
| `language`     | `en`                                 | The language in use                                      |

The test environment is `accessControlUrl: 'https://api.test/auth'`, `appName: 'test-app'`,
`baseUrl: 'https://api.test'`, `cookieName: 'test-session'` and `webApiPath: '/api'`.

`user` and `token` sign the session in without a request. Without them, whatever restores the session (the guards,
the OAuth callback, a `401` the interceptor refreshes) sends `POST https://api.test/auth/refresh`, which the spec
answers with `HttpTestingController`: `{ accessToken }` to sign in, or a `401` to stay signed out.

The password policy is not faked either. The first time a field with a policy renders (the new password of
`bey-password-change`, of the reset-password and accept-invitation pages, or the `password` of the registration),
`BeyPasswordPolicyService` sends `GET https://api.test/auth/password-policy`, once per spec. A spec that calls
`verify()` answers it, with the policy it wants to check against or with an error to keep the library defaults; one
that does not call it may leave it pending, and the fields check the defaults, a minimum of 8 characters:

```ts
TestBed.inject(HttpTestingController)
    .expectOne('https://api.test/auth/password-policy')
    .flush({ isDigitRequired: true, isLowercaseRequired: true, isSymbolRequired: true, isUppercaseRequired: true });
```

## Fakes

| Fake                        | Stands for              | Records                                                                                                           | Answers                                                                     |
| --------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `BeyFakeModalService`       | `BeyModalService`       | `confirmations()`, `errors()`, `infos()`, `warnings()`                                                            | Each confirmation with `false`, or what `setConfirmationAnswer(answer)` set |
| `BeyFakeToastService`       | `BeyToastService`       | `errors()`, `infos()`, `successes()`, `warnings()`                                                                | Nothing                                                                     |
| `BeyFakeModalFormService`   | `BeyModalFormService`   | `forms()`, whose callbacks the spec calls; a form opened `openWithRequest` sends its request and closes on submit | `canDeactivate()` with `true`                                               |
| `BeyFakeFilePreviewService` | `BeyFilePreviewService` | `previews()`                                                                                                      | A `BsModalRef`                                                              |
| `BeyFakeStorageService`     | `BeyStorageService`     | What is `set`, in memory                                                                                          | `get(key)`; nothing reaches `localStorage`, so no spec leaks into the next  |

Each record is the config exactly as the caller passed it. A confirmation emits at once, with the answer set
when it was opened. The modal methods return a `BsModalRef` whose `hide()` does nothing.

## DOM helpers

A `BeyQueryScope` is a fixture or an element.

| Function                                 | Returns                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `beyRenderComponent(component, inputs?)` | The fixture, with the inputs set and settled                                                                          |
| `beySettle(fixture)`                     | Once `detectChanges()`, `whenStable()` and `detectChanges()` again have run                                           |
| `beyButtonByName(scope, name)`           | The button or `role="button"` named `name` by text or `aria-label`; throws                                            |
| `beyQueryButton(scope, name)`            | The same, or `null`                                                                                                   |
| `beyControlByName(scope, name)`          | The input, select, textarea or grouping role named `name` by `aria-labelledby`, `aria-label` or its `<label>`; throws |
| `beyQueryControl(scope, name)`           | The same, or `null`                                                                                                   |
| `beyAccessibleName(element)`             | The name `beyControlByName` matches against                                                                           |
| `beyAccessibleDescription(element)`      | The text of what its `aria-describedby` points at, such as the hint or the error of a field; `''` when nothing        |
| `beyQueryAll(scope, selector)`           | Every match, as an array                                                                                              |
| `beyTextsOf(elements)`                   | Their trimmed texts                                                                                                   |
| `beyHostOf(scope)`                       | The element of a fixture, or the element itself                                                                       |

## Usage

```ts
describe('ContactsComponent', () => {
    let modal: BeyFakeModalService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ContactsComponent],
            providers: [provideBeyTesting({ translations: { en: { contacts: { delete: 'Delete' } } } })]
        });
        modal = TestBed.inject(BeyFakeModalService);
    });

    it('deletes the contact once the user confirms', async () => {
        modal.setConfirmationAnswer(true);
        const fixture = await beyRenderComponent(ContactsComponent, { contacts: [ada] });

        beyButtonByName(fixture, 'Delete').click();
        TestBed.inject(HttpTestingController).expectOne('https://api.test/api/contacts/1').flush({});
        await beySettle(fixture);

        expect(modal.confirmations()).toHaveLength(1);
        expect(beyTextsOf(beyQueryAll(fixture, '[role="row"]'))).toEqual([]);
    });
});
```
