import { inject, Injectable } from '@angular/core';

import { ModalFormService } from '../../../form/components/modal/services/modal-form.service';
import { PageHandle } from '../../../page/models/page.model';
import { saveAuditExport } from '../functions/audit-export';
import { AuditConfig, AuditEventRow } from '../models/audit.model';
import { AuditFormService } from './audit-form.service';
import { AuditHttpService } from './audit-http.service';

@Injectable({
    providedIn: 'root'
})
export class AuditActionsService {
    private readonly auditFormService = inject(AuditFormService);
    private readonly auditHttpService = inject(AuditHttpService);
    private readonly modalFormService = inject(ModalFormService);

    exportEvents({ baseUrl }: AuditConfig, page?: PageHandle<AuditEventRow>): void {
        if (!page) {
            return;
        }

        this.auditHttpService.exportEvents(baseUrl, page.search()).subscribe(content => saveAuditExport(content));
    }

    view({ actionLabels, baseUrl, entityLabels, prefix }: AuditConfig, event: AuditEventRow): void {
        this.auditHttpService
            .loadEvent(baseUrl, event.id)
            .subscribe(loaded =>
                this.modalFormService.open(
                    this.auditFormService.buildViewConfig({ actionLabels, entityLabels, event: loaded, prefix })
                )
            );
    }
}
