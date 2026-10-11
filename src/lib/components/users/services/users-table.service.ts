import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BadgeConfig, BadgeVariant } from '../../badge/models/badge.model';
import { pageOrganizationCell } from '../../page/functions/page-organization-column';
import { PageStandardAction } from '../../page/models/page-action.model';
import {
    BadgeTableCell,
    DateTableCell,
    LinkTableCell,
    TableCell,
    TextTableCell
} from '../../table/models/table-cell.model';
import { userFullName, userRoleLabel } from '../functions/user-labels';
import { USER_STATUS_BADGE_VARIANTS, UserRow, UsersRowOptions } from '../models/users.model';

const CREATED_FORMAT = 'yyyy-MM-dd';
const LAST_LOGIN_FORMAT = 'yyyy-MM-dd HH:mm';

@Injectable({
    providedIn: 'root'
})
export class UsersTableService {
    private readonly translateService = inject(TranslateService);

    loadRow(user: UserRow, { isOrganizationShown, onEdit, prefix, rolePrefix }: UsersRowOptions): TableCell[] {
        return [
            this.buildNameCell(user, prefix, onEdit),
            new TextTableCell({ content: user.email, tooltip: user.email }),
            ...(isOrganizationShown ? [buildOrganizationCell(user, prefix)] : []),
            new BadgeTableCell({
                badges: user.roles.map(
                    role =>
                        new BadgeConfig({
                            isTranslated: false,
                            label: userRoleLabel(role, rolePrefix, key => this.translateService.instant(key) as string),
                            variant: BadgeVariant.Primary
                        })
                )
            }),
            new BadgeTableCell({
                badges: [
                    new BadgeConfig({
                        label: `${prefix}.status.${user.status}`,
                        variant: USER_STATUS_BADGE_VARIANTS[user.status] ?? BadgeVariant.Neutral
                    })
                ],
                translate: true
            }),
            new DateTableCell({ format: LAST_LOGIN_FORMAT, value: user.lastLoginAt }),
            new DateTableCell({ format: CREATED_FORMAT, value: user.createdAt })
        ];
    }

    private buildNameCell(user: UserRow, prefix: string, onEdit: (user: UserRow) => void): TableCell {
        const name = userFullName(user);
        const content = name || `${prefix}.table.no-name`;
        const tooltip = name || undefined;
        const translate = !name;

        return user.actions.includes(PageStandardAction.Edit)
            ? new LinkTableCell({ action: () => onEdit(user), content, tooltip, translate })
            : new TextTableCell({ content, tooltip, translate });
    }
}

function buildOrganizationCell(user: UserRow, prefix: string): TableCell {
    return user.organizationId === null
        ? new TextTableCell({ content: `${prefix}.table.system`, translate: true })
        : pageOrganizationCell(user);
}
