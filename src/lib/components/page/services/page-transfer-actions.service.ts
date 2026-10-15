import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';

import { ToastService } from '../../toast/services/toast.service';
import { toTrashItems } from '../functions/page-row';
import { readTransferOwners } from '../functions/page-transfer-owners';
import { PageConfig } from '../models/page.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_TRANSFER_SUCCESS_TOAST, PageTransferConfig } from '../models/page-transfer.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageTransferFormService } from './page-transfer-form.service';

const SEVERAL = 'other';
const SINGLE = 'one';

@Injectable({
    providedIn: 'root'
})
export class PageTransferActionsService {
    private readonly pageFormService = inject(PageFormService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageTransferFormService = inject(PageTransferFormService);
    private readonly toastService = inject(ToastService);
    private readonly translateService = inject(TranslateService);

    transfer(config: PageConfig, items: PageItem[], onTransferred: () => void): void {
        const { baseUrl, tableConfig, transferConfig = new PageTransferConfig() } = config;

        if (!baseUrl || items.length === 0) {
            return;
        }

        const entries = toTrashItems(items, tableConfig?.categoriesConfig);

        this.pageFormService.openWithRequest(
            this.pageTransferFormService.buildTransferForm({
                count: items.length,
                notice: transferConfig.notice,
                owners: readTransferOwners(items),
                searchTargets: (search, limit) =>
                    this.pageHttpService.searchTransferTargets(baseUrl, entries, search, limit)
            }),
            ({ main }) =>
                this.pageHttpService
                    .transfer(baseUrl, entries, main.targetUserId)
                    .pipe(tap(({ transferred }) => this.reportTransferred(transferred))),
            onTransferred
        );
    }

    private reportTransferred(count: number): void {
        this.toastService.showSuccess({
            message: this.translateService.instant(`${PAGE_TRANSFER_SUCCESS_TOAST}.${count === 1 ? SINGLE : SEVERAL}`, {
                count
            }) as string
        });
    }
}
