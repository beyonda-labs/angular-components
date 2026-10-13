import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PageStandardAction } from '../../../page/models/page-action.model';
import { LinkTableCell, TableCell, TextTableCell } from '../../../table/models/table-cell.model';
import {
    auditEventLabel,
    auditOrganizationName,
    auditRowName,
    auditTime,
    auditUserLabel
} from '../functions/audit-labels';
import { AuditEventRow, AuditRowOptions } from '../models/audit.model';

@Injectable({
    providedIn: 'root'
})
export class AuditTableService {
    private readonly translateService = inject(TranslateService);

    loadRow(event: AuditEventRow, { isOrganizationShown, onView, ...labels }: AuditRowOptions): TableCell[] {
        const translate = (key: string): string => this.translateService.instant(key) as string;
        const user = auditUserLabel(event, translate);
        const action = auditEventLabel(event, labels, translate);
        const organization = auditOrganizationName(event, translate);
        const time = auditTime(event.occurredAt, this.translateService.currentLang);

        return [
            new TextTableCell({ content: time, tooltip: time }),
            new TextTableCell({ content: user, tooltip: user }),
            new TextTableCell({ content: action, tooltip: action }),
            buildRowNameCell(event, translate, onView),
            new TextTableCell({ content: event.ip ?? '' }),
            ...(isOrganizationShown
                ? [new TextTableCell({ content: organization, tooltip: organization || undefined })]
                : [])
        ];
    }
}

function buildRowNameCell(
    event: AuditEventRow,
    translate: (key: string) => string,
    onView: (event: AuditEventRow) => void
): TableCell {
    const content = auditRowName(event, translate);
    const tooltip = content || undefined;

    return content && event.actions.includes(PageStandardAction.View)
        ? new LinkTableCell({ action: () => onView(event), content, tooltip })
        : new TextTableCell({ content, tooltip });
}
