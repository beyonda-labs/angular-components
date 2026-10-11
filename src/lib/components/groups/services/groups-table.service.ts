import { Injectable } from '@angular/core';

import { pageOrganizationCell } from '../../page/functions/page-organization-column';
import { PageStandardAction } from '../../page/models/page-action.model';
import { DateTableCell, LinkTableCell, TableCell, TextTableCell } from '../../table/models/table-cell.model';
import { GroupRow, GroupsRowOptions } from '../models/groups.model';

const CREATED_FORMAT = 'yyyy-MM-dd';

@Injectable({
    providedIn: 'root'
})
export class GroupsTableService {
    loadRow(group: GroupRow, { isOrganizationShown, onEdit }: GroupsRowOptions): TableCell[] {
        const { name } = group;

        return [
            group.actions.includes(PageStandardAction.Edit)
                ? new LinkTableCell({ action: () => onEdit(group), content: name, tooltip: name })
                : new TextTableCell({ content: name, tooltip: name }),
            new TextTableCell({ content: String(group.memberCount) }),
            ...(isOrganizationShown ? [pageOrganizationCell(group)] : []),
            new DateTableCell({ format: CREATED_FORMAT, value: group.createdAt })
        ];
    }
}
