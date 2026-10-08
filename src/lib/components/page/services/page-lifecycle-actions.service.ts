import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, of, switchMap } from 'rxjs';

import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { ModalService } from '../../modal/services/modal.service';
import { ToastService } from '../../toast/services/toast.service';
import { buildChangeStatusForm, buildDuplicateForm } from '../functions/page-lifecycle-forms';
import { readRowField } from '../functions/page-row';
import { PageConfig } from '../models/page.model';
import { PageAction } from '../models/page-action.model';
import { PageRestoredRename } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PAGE_LIFECYCLE_FORM_SECTION, PageDuplicationConfig } from '../models/page-lifecycle.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

const RESTORED_RENAMED_KEY = 'angular-components.page.toast.restored-renamed';

@Injectable({
    providedIn: 'root'
})
export class PageLifecycleActionsService {
    private readonly modalService = inject(ModalService);
    private readonly pageFormService = inject(PageFormService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly toastService = inject(ToastService);
    private readonly translateService = inject(TranslateService);

    changeStatus(config: PageConfig, item: PageItem, onSaved: () => void): void {
        const { baseUrl, prefix, statusConfig } = config;

        if (!baseUrl || !statusConfig) {
            return;
        }

        const { field, transitions } = statusConfig;

        this.pageFormService.openWithRequest(
            buildChangeStatusForm(prefix, field, transitions[String(readRowField(item, field))] ?? []),
            value =>
                this.pageHttpService.changeStatus(
                    baseUrl,
                    item.id,
                    value[PAGE_LIFECYCLE_FORM_SECTION],
                    `${prefix}.toast.change-status-success`
                ),
            onSaved
        );
    }

    duplicate(config: PageConfig, item: PageItem, onSaved: () => void): void {
        const { baseUrl, duplicationConfig = new PageDuplicationConfig(), prefix } = config;

        if (!baseUrl) {
            return;
        }

        const { copySeparator, nameField, nameValidators } = duplicationConfig;
        const copySuffix = this.translateService.instant(`${prefix}.duplicate.copy-suffix`) as string;
        const copyName = `${String(readRowField(item, nameField) ?? '')}${copySeparator}${copySuffix}`;

        this.pageFormService.openWithRequest(
            buildDuplicateForm(prefix, nameField, copyName, nameValidators),
            value =>
                this.pageHttpService.duplicate(
                    baseUrl,
                    item.id,
                    value[PAGE_LIFECYCLE_FORM_SECTION],
                    `${prefix}.toast.duplicate-success`
                ),
            onSaved
        );
    }

    emptyTrash(config: PageConfig, action: PageAction, onEmptied: () => void): void {
        const { baseUrl, prefix } = config;

        if (!baseUrl) {
            return;
        }

        const confirmation: ConfirmationModalConfig = {
            message: `${prefix}.modal.empty-trash.message`,
            title: `${prefix}.modal.empty-trash.title`
        };
        const asked = action.confirmation?.([], confirmation) ?? confirmation;

        (isObservable(asked) ? asked : of(asked))
            .pipe(switchMap(modalConfig => this.modalService.openConfirmation(modalConfig)))
            .subscribe(confirmed => {
                if (confirmed) {
                    this.pageHttpService
                        .emptyTrash(baseUrl, `${prefix}.toast.empty-trash-success`)
                        .subscribe(() => onEmptied());
                }
            });
    }

    reportRenamed(renamed: PageRestoredRename[]): void {
        if (renamed.length === 0) {
            return;
        }

        this.toastService.showInfo({
            message: this.translateService.instant(RESTORED_RENAMED_KEY, {
                names: renamed.map(({ from, to }) => `"${from}" → "${to}"`).join(', ')
            })
        });
    }
}
