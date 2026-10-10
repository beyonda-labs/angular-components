# Password policy

`BeyPasswordPolicyService` reads the password policy of the server, `GET {accessControlUrl}/password-policy` of the
authentication module of express-components, and shares it with every password field that asks for it. The request
is lazy: it leaves the first time something reads `policy`, which a field does when it renders its rules, and it
leaves once for the whole app, whoever reads it after. Until it answers, and for good if it fails, `policy` holds the
library defaults: at least 8 characters, at most 128, and no other rule. A failure opens no error modal, since the
server checks the policy again on every flow that sets a password and refuses what breaks it with one of the
`password.*` errors below. The library hands the policy to `bey-password-change`, the reset-password and
accept-invitation pages and the registration; an app gives it to a field of its own as `policy` of a
`BeyFormPasswordField`, whose rules the [form fields](../../../components/form/docs/form-fields-readme.md#password-policy)
describe.

## Usage

```ts
private readonly passwordPolicyService = inject(BeyPasswordPolicyService);

readonly password = new BeyFormPasswordField({
    autocomplete: 'new-password',
    isRequired: true,
    key: 'password',
    policy: this.passwordPolicyService.policy
});
```

A field can take a fixed policy too, such as one an app builds itself:
`policy: new BeyPasswordPolicy({ isDigitRequired: true, minLength: 12 })`.

## BeyPasswordPolicyService

| Member   | Meaning                                                                             |
| -------- | ----------------------------------------------------------------------------------- |
| `policy` | Signal of the `BeyPasswordPolicy` in use; reading it asks the server the first time |

## BeyPasswordPolicy

It mirrors the JSON the server answers, and each field the answer leaves out keeps its default.

| Field                 | Default | Meaning                                                          |
| --------------------- | ------- | ---------------------------------------------------------------- |
| `minLength`           | `8`     | Fewest characters, counted as code points                        |
| `maxLength`           | `128`   | Most characters, counted as code points                          |
| `isUppercaseRequired` | `false` | At least one uppercase letter, `\p{Lu}`                          |
| `isLowercaseRequired` | `false` | At least one lowercase letter, `\p{Ll}`                          |
| `isDigitRequired`     | `false` | At least one decimal digit, `\p{Nd}`                             |
| `isSymbolRequired`    | `false` | At least one character that is not a letter, a number or a space |

## Errors

The texts of the errors the server answers when a password breaks its policy, first broken rule first, ship under
`angular-components.http.error.password.*` and `angular-components.http.title.password.*`:

| `messageKey`                  | Parameters |
| ----------------------------- | ---------- |
| `password.too-short`          | `min`      |
| `password.too-long`           | `max`      |
| `password.uppercase-required` |            |
| `password.lowercase-required` |            |
| `password.digit-required`     |            |
| `password.symbol-required`    |            |

## Specs

`provideBeyTesting` keeps the real service, so a spec that renders one of those fields sees
`GET https://api.test/auth/password-policy` leave and answers it with `HttpTestingController`, or leaves it pending
when it does not call `verify()`; until it is answered, the fields check the defaults.
