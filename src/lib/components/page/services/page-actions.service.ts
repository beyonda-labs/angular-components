import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { HeaderAction } from '../../header/models/header.model';
import { ModalService } from '../../modal/services/modal.service';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

/** Page state and callbacks the actions need to run; provided by the page service on execution. */
export interface PageActionsContext {
    config: PageConfig;
    onDeleted: () => void;
    onFormModalOpened: (reference: BsModalRef<ModalFormDialogComponent>) => void;
    onSaved: () => void;
    selectedItems: () => PageItem[];
}

@Injectable({
    providedIn: 'root'
})
export class PageActionsService {
    private readonly modalService = inject(ModalService);
    private readonly pageFormService = inject(PageFormService);
    private readonly pageHttpService = inject(PageHttpService);

    buildHeaderActions(
        actions: PageAction[],
        zone: PageActionZone,
        execute: (action: PageAction) => void
    ): HeaderAction[] {
        return actions
            .filter(action => action.zone === zone)
            .map(
                action =>
                    new HeaderAction({
                        action: () => execute(action),
                        icon: action.icon,
                        key: action.key,
                        label: action.label,
                        tooltip: action.tooltip,
                        type: action.type
                    })
            );
    }

    executeAction(action: PageAction, context: PageActionsContext): void {
        if (action.handler) {
            action.handler(action.scope === PageActionScope.Item ? context.selectedItems() : undefined);

            return;
        }

        switch (action.key) {
            case PageStandardAction.Create:
                this.executeCreate(context);
                break;

            case PageStandardAction.Delete:
                this.executeDelete(context);
                break;

            case PageStandardAction.Edit:
                this.executeEdit(context);
                break;

            default:
                break;
        }
    }

    filterVisibleActions(actions: PageAction[], allowedKeys: string[] | null, selectedItems: PageItem[]): PageAction[] {
        return actions.filter(action => {
            if (action.scope === PageActionScope.Global) {
                return allowedKeys?.includes(action.key) ?? false;
            }

            if (selectedItems.length === 0) {
                return false;
            }

            if (action.key === PageStandardAction.Edit && selectedItems.length !== 1) {
                return false;
            }

            return selectedItems.every(item => item.actions?.includes(action.key));
        });
    }

    private executeCreate(context: PageActionsContext): void {
        this.openForm(context);
    }

    private executeDelete(context: PageActionsContext): void {
        const items = context.selectedItems();
        const { baseUrl, prefix } = context.config;

        if (items.length === 0 || !baseUrl) {
            return;
        }

        this.modalService
            .openConfirmation({
                message: 'angular-components.page.delete.message',
                messageParameters: { count: items.length },
                title: 'angular-components.page.delete.title'
            })
            .subscribe(confirmed => {
                if (!confirmed) {
                    return;
                }

                this.pageHttpService
                    .deleteItems(
                        baseUrl,
                        items.map(item => item.id),
                        `${prefix}.delete.success`
                    )
                    .subscribe(() => context.onDeleted());
            });
    }

    private executeEdit(context: PageActionsContext): void {
        const items = context.selectedItems();

        if (items.length === 1) {
            this.openForm(context, items[0]);
        }
    }

    private openForm(context: PageActionsContext, item?: PageItem): void {
        const pageForm = context.config.formConfig;

        if (!pageForm) {
            return;
        }

        const reference = this.pageFormService.open(pageForm, item, context.config.prefix, (value, form) =>
            this.save(context, value, form, item)
        );

        context.onFormModalOpened(reference);
    }

    private save(context: PageActionsContext, value: unknown, form: ModalFormConfig, original?: PageItem): void {
        const { baseUrl, prefix } = context.config;

        if (!baseUrl) {
            form.close();

            return;
        }

        const successToast = `${prefix}.save.success`;
        const request = original
            ? this.pageHttpService.edit(baseUrl, original.id, value, successToast)
            : this.pageHttpService.create(baseUrl, value, successToast);

        request.subscribe(() => {
            form.close();
            context.onSaved();
        });
    }
}
