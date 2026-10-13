# Organization summary

The organization of the signed-in member at a glance, read-only, one of the blocks an app composes into a page inside
`bey-app-layout`. It is built with the [cards module](../../../cards/docs/cards-readme.md) in one `bey-card` across the
whole width, with nothing to edit. It reads `GET {organizationsUrl}/current` of the organizations module of
express-components, which answers a holder of `organization.read` (a permission no base role holds in the library: the
app gives it, or an extra role does) with `{ id, name, status, createdAt, administrators: [{ id, email, name?, surname?
}], counts: { members, groups, extraRoles, byStatus? }, groups: [{ id, name, memberCount?, members: [{ id, email, name?,
surname? }] }], ungroupedMembers?: [{ id, email, name?, surname? }], extraRoles: [{ id, name, description?,
permissions? }] }` (`BeyOrganizationSummary`, with `BeyOrganizationSummaryAdministrator`,
`BeyOrganizationSummaryCounts`, `BeyOrganizationSummaryStatusCounts`, `BeyOrganizationSummaryGroup`,
`BeyOrganizationSummaryMember` and `BeyOrganizationSummaryExtraRole`), and shows:

-   **The page title**: "Organization" (`title`) in a `bey-header` above the card, as every page shows its title;
-   **The header of the card**: the name of the organization as its title and "Created on {{date}}" (`created-at`), the
    date long in the language in use. No status shows: only the members of an active organization can sign in;
-   **The figures**, in a `bey-card-stats`: the members, which the server counts among the active ones only, the groups
    and the additional roles, each label in the singular for one and in the plural otherwise (`stats.<figure>.one` and
    `.other`);
-   with `counts.byStatus`, which the server adds for whoever also holds `users.read`, a muted line under them with the
    members by status, leaving out the statuses with none: "2 active · 1 inactive · 1 pending invitation"
    (`breakdown.<status>.one` and `.other`);
-   **Administrators** (`administrators.label`), with their count, each with the initials of the name, the name and
    the email, or the email alone, and "No administrators yet." (`administrators.empty`) without any;
-   **Groups** (`groups.label`), with their count, every group of the organization in the order of the server, folded:
    its name, "N members" (`groups.members.one` and `.other`, the active ones), and "Show members"
    (`groups.show-members`), which unfolds them in place in the look of the administrators and then reads "Hide
    members" (`groups.hide-members`); an empty group shows its "0 members" and nothing to unfold. Last, with the same
    look, "No group" (`groups.ungrouped`) holds the active members who are in no group, only when there is someone. With
    neither groups nor anyone out of them, "This organization has no groups yet." (`groups.empty`);
-   **Additional roles** (`extra-roles.label`), with their count, a row per role with its name and description, in the
    one card the administrators and the groups use, every row as tall as one with a subtitle. The row of a role
    answered with its `permissions`, which the server sends only to whoever may already see them (a holder of
    `roles.manage` for every role, a holder of `organization.read-roles` for the roles they hold), is a button with a
    chevron that opens them read-only, in the view the roles page and the groups of a member open; the others show no
    action. "This organization has no additional roles yet." (`extra-roles.empty`) without any.

On a narrow screen the groups and the additional roles stack. A server that answers no `ungroupedMembers` counts as
one with nobody out of the groups, and a group without `memberCount` counts the members it lists. Nothing but the
page title shows until the answer comes. A superadmin belongs to no organization and gets `404`, whose reason the error
modal shows, as for any request; an app offers the block to the members of an organization only.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly organizationSummaryConfig = new BeyOrganizationSummaryConfig({ rolesConfig: this.rolesConfig });
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-organization-summary [config]="organizationSummaryConfig"></bey-organization-summary>
</bey-app-layout>
```

## BeyOrganizationSummaryConfig

| Field              | Default                                     | Meaning                                                                                                     |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `organizationsUrl` | `'/organizations'`                          | Path of the organizations, resolved against the environment's `baseUrl` and `webApiPath`                    |
| `prefix`           | `'angular-components.organization-summary'` | i18n prefix every text of the block resolves from                                                           |
| `rolesConfig`      | the defaults of `BeyRolesConfig`            | `BeyRoleViewSettings` (a `BeyRolesConfig` fits): the texts, sections and order of the permissions of a role |

`organizationsUrl` follows the `path` of the organizations module of express-components, as `baseUrl` of
[`bey-organizations`](../../organizations/docs/organizations-readme.md) does, and `rolesConfig` is the one
`BeyGroupsConfig` takes for the same view.

## Texts

Under `prefix`: `title`, `created-at`, `stats.members`, `.groups` and `.extra-roles` (each `.one` and `.other`),
`breakdown.active`, `.inactive`, `.invited` and `.unverified` (each `.one` and `.other`), `administrators.label` and
`.empty`, `groups.label`, `.empty`, `.members.one` and `.other`, `.show-members`, `.hide-members` and `.ungrouped`,
and `extra-roles.label` and `.empty`. The module ships all of them in English and Spanish. The read-only
view of a role reads its texts under the `prefix` of `rolesConfig`, as the roles page does (`view.*`).
