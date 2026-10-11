import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { readRowField } from '../functions/page-row';
import { buildShareChoices, readShareEntries } from '../functions/page-shares';
import { PageConfig } from '../models/page.model';
import { PageItem } from '../models/page-item.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageShareFormService } from './page-share-form.service';

@Injectable({
    providedIn: 'root'
})
export class PageShareActionsService {
    private readonly pageFormService = inject(PageFormService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageShareFormService = inject(PageShareFormService);

    share(config: PageConfig, folder: PageItem, onSaved: () => void): void {
        const { baseUrl, prefix, tableConfig } = config;
        const categoriesConfig = tableConfig?.categoriesConfig;

        if (!baseUrl || !categoriesConfig) {
            return;
        }

        forkJoin([
            this.pageHttpService.findShares(baseUrl, folder.id),
            this.pageHttpService.findShareTargets(baseUrl, folder.id)
        ]).subscribe(([shares, targets]) => {
            const choices = buildShareChoices(shares, targets);
            const folderName = String(readRowField(folder, categoriesConfig.nameField) ?? '');

            this.pageFormService.openWithRequest(
                this.pageShareFormService.buildShareForm(folderName, choices, shares.inherited),
                value =>
                    this.pageHttpService.saveShares(
                        baseUrl,
                        folder.id,
                        readShareEntries(choices, value, shares.shares),
                        `${prefix}.toast.share-success`
                    ),
                onSaved
            );
        });
    }
}
