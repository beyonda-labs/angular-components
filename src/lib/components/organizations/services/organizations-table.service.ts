import { Injectable } from '@angular/core';

import { BadgeConfig, BadgeVariant } from '../../badge/models/badge.model';
import { PageStandardAction } from '../../page/models/page-action.model';
import {
    BadgeTableCell,
    DateTableCell,
    LinkTableCell,
    TableCell,
    TextTableCell
} from '../../table/models/table-cell.model';
import {
    ORGANIZATION_STATUS_BADGE_VARIANTS,
    OrganizationRow,
    OrganizationsRowOptions
} from '../models/organizations.model';

const CREATED_FORMAT = 'yyyy-MM-dd';

@Injectable({
    providedIn: 'root'
})
export class OrganizationsTableService {
    loadRow(organization: OrganizationRow, { onEdit, prefix }: OrganizationsRowOptions): TableCell[] {
        const { name } = organization;

        return [
            organization.actions.includes(PageStandardAction.Edit)
                ? new LinkTableCell({ action: () => onEdit(organization), content: name, tooltip: name })
                : new TextTableCell({ content: name, tooltip: name }),
            new BadgeTableCell({
                badges: [
                    new BadgeConfig({
                        label: `${prefix}.status.${organization.status}`,
                        variant: ORGANIZATION_STATUS_BADGE_VARIANTS[organization.status] ?? BadgeVariant.Neutral
                    })
                ],
                translate: true
            }),
            new TextTableCell({ content: String(organization.userCount) }),
            new DateTableCell({ format: CREATED_FORMAT, value: organization.createdAt })
        ];
    }
}
