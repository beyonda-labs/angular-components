import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BadgeConfig } from '../../badge/models/badge.model';
import { pageOrganizationCell } from '../../page/functions/page-organization-column';
import { PageStandardAction } from '../../page/models/page-action.model';
import { BadgeTableCell, LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { roleLabel } from '../functions/role-labels';
import { ROLE_TYPE_VARIANTS, RoleRow, RolesRowOptions } from '../models/roles.model';

@Injectable({
    providedIn: 'root'
})
export class RolesTableService {
    private readonly translateService = inject(TranslateService);

    loadRow(role: RoleRow, { isOrganizationShown, onEdit, onView, prefix, rolePrefix }: RolesRowOptions): TableCell[] {
        const name = roleLabel(role, rolePrefix, key => this.translateService.instant(key) as string);
        const type = role.isBase ? 'base' : 'extra';

        return [
            role.actions.includes(PageStandardAction.Edit)
                ? new LinkTableCell({ action: () => onEdit(role), content: name, tooltip: name })
                : new LinkTableCell({
                      action: () => onView(role),
                      content: name,
                      tooltip: `${prefix}.table.view-permissions`
                  }),
            new BadgeTableCell({
                badges: [new BadgeConfig({ label: `${prefix}.type.${type}`, variant: ROLE_TYPE_VARIANTS[type] })],
                translate: true
            }),
            new TextTableCell({ content: String(role.permissions.length) }),
            new TextTableCell({ content: String(role.memberCount) }),
            ...(isOrganizationShown ? [buildOrganizationCell(role, prefix)] : []),
            new TextTableCell({ content: role.description ?? '', tooltip: role.description })
        ];
    }
}

function buildOrganizationCell(role: RoleRow, prefix: string): TableCell {
    return role.isBase
        ? new TextTableCell({ content: `${prefix}.table.every-organization`, translate: true })
        : pageOrganizationCell(role);
}
