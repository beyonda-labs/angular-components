import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormInfoField, FormInfoItem } from '../../../form/models/fields/form-info-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { auditDetailEntries } from '../functions/audit-details';
import {
    auditEventLabel,
    auditOrganizationName,
    auditRowName,
    auditTime,
    auditUserLabel
} from '../functions/audit-labels';
import { AUDIT_FORM_SECTION, AuditViewOptions } from '../models/audit.model';

@Injectable({
    providedIn: 'root'
})
export class AuditFormService {
    private readonly translateService = inject(TranslateService);

    buildViewConfig({ event, prefix, ...labels }: AuditViewOptions): ModalFormConfig {
        const translate = (key: string): string => this.translateService.instant(key) as string;
        const none = translate(`${prefix}.view.none`);
        const details = auditDetailEntries(event);

        return new ModalFormConfig({
            cancelLabel: `${prefix}.view.buttons.close`,
            isSubmitHidden: true,
            prefix: `${prefix}.view`,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: AUDIT_FORM_SECTION,
                    rows: [
                        infoRow('occurredAt', [
                            { label: auditTime(event.occurredAt, this.translateService.currentLang) }
                        ]),
                        infoRow('user', [
                            { label: auditUserLabel(event, translate), tooltip: event.userId ?? undefined }
                        ]),
                        infoRow('action', [{ label: auditEventLabel(event, labels, translate) }]),
                        infoRow('entity', [
                            { label: auditRowName(event, translate) || none, tooltip: event.entityId ?? undefined }
                        ]),
                        ...(event.organizationName === undefined
                            ? []
                            : [infoRow('organization', [{ label: auditOrganizationName(event, translate) || none }])]),
                        infoRow('ip', [{ label: event.ip ?? none }]),
                        infoRow('requestId', [{ label: event.requestId ?? none }]),
                        ...(details.length > 0
                            ? [
                                  infoRow(
                                      'details',
                                      details.map(({ key, value }) => ({ label: `${key}: ${value}` }))
                                  )
                              ]
                            : [])
                    ]
                })
            ]
        });
    }
}

function infoRow(key: string, items: FormInfoItem[]): FormRow {
    return new FormRow({ fields: [new FormInfoField({ items, key })] });
}
