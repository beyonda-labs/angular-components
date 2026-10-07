import { inject, Injectable, Signal, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, of } from 'rxjs';

import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { isCategoryRow } from '../functions/page-row';
import { buildInUseConfirmation, describeUsers, readRowUsers } from '../functions/page-usages';
import { PageConfig } from '../models/page.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_USAGE_CHECKED_ACTIONS, PageUsages, PageUsagesConfig } from '../models/page-usages.model';
import { PageHttpService } from './page-http.service';

@Injectable({
    providedIn: 'root'
})
export class PageUsagesService {
    private readonly pageHttpService = inject(PageHttpService);
    private readonly translateService = inject(TranslateService);

    confirmInUse(
        config: PageConfig,
        key: string,
        items: PageItem[],
        confirmation: ConfirmationModalConfig
    ): Observable<ConfirmationModalConfig> {
        const { baseUrl, prefix, tableConfig, usagesConfig } = config;
        const ids = items.filter(item => !isCategoryRow(item, tableConfig?.categoriesConfig)).map(({ id }) => id);

        if (!usagesConfig || !baseUrl || ids.length === 0 || !PAGE_USAGE_CHECKED_ACTIONS.has(key)) {
            return of(confirmation);
        }

        return this.find(baseUrl, ids).pipe(
            map(usages =>
                buildInUseConfirmation({
                    confirmation,
                    inUseModal: `${prefix}.modal.${key}-in-use`,
                    listedUsers: usagesConfig.listedUsers,
                    selectedIds: items.map(({ id }) => id),
                    suffixes: this.translateSuffixes(usagesConfig),
                    usages
                })
            )
        );
    }

    find(baseUrl: string, ids: (string | number)[]): Observable<PageUsages[]> {
        return ids.length === 0 ? of([]) : this.pageHttpService.findUsages(baseUrl, ids);
    }

    listUsers(baseUrl: string, item: PageItem, usagesConfig: PageUsagesConfig): Signal<string[]> {
        const suffixes = this.translateSuffixes(usagesConfig);
        const { total, users } = readRowUsers(item);
        const names = signal(describeUsers(users, total, suffixes));

        if (total > users.length) {
            this.find(baseUrl, [item.id]).subscribe(([usage]) => {
                if (usage) {
                    names.set(describeUsers(usage.users, usage.total, suffixes));
                }
            });
        }

        return names.asReadonly();
    }

    private translateSuffixes({ suffixes }: PageUsagesConfig): Record<string, string> {
        return Object.fromEntries(
            Object.entries(suffixes).map(([kind, key]) => [kind, this.translateService.instant(key) as string])
        );
    }
}
