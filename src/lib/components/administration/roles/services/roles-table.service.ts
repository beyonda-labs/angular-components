import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BadgeConfig } from '../../../badge/models/badge.model';
import { pageOrganizationCell } from '../../../page/functions/page-organization-column';
import { PageStandardAction } from '../../../page/models/page-action.model';
import { BadgeTableCell, LinkTableCell, TableCell, TextTableCell } from '../../../table/models/table-cell.model';
import { roleLabel } from '../../functions/role-labels';
import {
    ROLE_TYPE_VARIANTS,
    RoleRow,
    ROLES_SOURCES_SEPARATOR,
    RoleSource,
    RoleSourceType,
    RolesRowOptions
} from '../models/roles.model';

const GROUP_NAMES_SEPARATOR = ', ';

@Injectable({
    providedIn: 'root'
})
export class RolesTableService {
    private readonly translateService = inject(TranslateService);

    loadRow(role: RoleRow, options: RolesRowOptions): TableCell[] {
        const { isOrganizationShown, isReadOnly, onEdit, onView, prefix, rolePrefix } = options;
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
            ...(isReadOnly
                ? [this.buildSourcesCell(role.sources ?? [], prefix)]
                : [
                      new TextTableCell({ content: String(role.memberCount ?? 0) }),
                      new TextTableCell({ content: String(role.groupCount ?? 0) })
                  ]),
            ...(isOrganizationShown ? [buildOrganizationCell(role, prefix)] : []),
            new TextTableCell({ content: role.description ?? '', tooltip: role.description })
        ];
    }

    private buildSourcesCell(sources: RoleSource[], prefix: string): TableCell {
        const groupNames = sources.flatMap(source => (source.type === RoleSourceType.Group ? [source.groupName] : []));
        const parts = [
            ...(sources.some(({ type }) => type === RoleSourceType.Direct)
                ? [this.translateService.instant(`${prefix}.sources.direct`) as string]
                : []),
            ...(groupNames.length > 0
                ? [
                      this.translateService.instant(`${prefix}.sources.group`, {
                          names: groupNames.join(GROUP_NAMES_SEPARATOR)
                      }) as string
                  ]
                : [])
        ];
        const content = parts.join(ROLES_SOURCES_SEPARATOR);

        return new TextTableCell({ content, tooltip: content || undefined });
    }
}

function buildOrganizationCell(role: RoleRow, prefix: string): TableCell {
    return role.isBase
        ? new TextTableCell({ content: `${prefix}.table.every-organization`, translate: true })
        : pageOrganizationCell(role);
}
