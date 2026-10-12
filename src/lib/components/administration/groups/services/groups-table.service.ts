import { Injectable } from '@angular/core';

import { pageOrganizationCell } from '../../../page/functions/page-organization-column';
import { PageStandardAction } from '../../../page/models/page-action.model';
import { DateTableCell, LinkTableCell, TableCell, TextTableCell } from '../../../table/models/table-cell.model';
import { GroupRow, GroupsPageMode, GroupsRowOptions } from '../models/groups.model';

const CREATED_FORMAT = 'yyyy-MM-dd';

@Injectable({
    providedIn: 'root'
})
export class GroupsTableService {
    loadRow(group: GroupRow, options: GroupsRowOptions): TableCell[] {
        const { isOrganizationShown, mode } = options;

        return [
            buildNameCell(group, options),
            new TextTableCell({ content: String(group.memberCount) }),
            ...(mode === GroupsPageMode.Manage
                ? [
                      new TextTableCell({ content: String(group.extraRoleCount ?? 0) }),
                      ...(isOrganizationShown ? [pageOrganizationCell(group)] : [])
                  ]
                : []),
            ...(mode === GroupsPageMode.ReadWithRoles
                ? [new TextTableCell({ content: String(group.roleCount ?? 0) })]
                : []),
            new DateTableCell({ format: CREATED_FORMAT, value: group.createdAt })
        ];
    }
}

function buildNameCell(group: GroupRow, { mode, onEdit, onView, prefix }: GroupsRowOptions): TableCell {
    const { name } = group;

    if (group.actions.includes(PageStandardAction.Edit)) {
        return new LinkTableCell({ action: () => onEdit(group), content: name, tooltip: name });
    }

    return mode === GroupsPageMode.Manage && !group.actions.includes(PageStandardAction.View)
        ? new TextTableCell({ content: name, tooltip: name })
        : new LinkTableCell({ action: () => onView(group), content: name, tooltip: `${prefix}.table.view-group` });
}
