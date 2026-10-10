import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { isObservable, map, Observable, of, switchMap } from 'rxjs';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormHandle } from '../../form/models/form.model';
import { HeaderAction } from '../../header/models/header.model';
import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { ModalService } from '../../modal/services/modal.service';
import { ModalTreeConfig } from '../../tree/components/modal/models/modal-tree.model';
import { ModalTreeService } from '../../tree/components/modal/services/modal-tree.service';
import { readMoveOwnerId } from '../functions/page-move-owner';
import { buildMoveTargetNodes } from '../functions/page-move-targets';
import { isActionVisible, isCategoryRow, toHandlerItems, toTrashItems } from '../functions/page-row';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageMoveTarget } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageLifecycleActionsService } from './page-lifecycle-actions.service';
import { PageUsagesService } from './page-usages.service';

export interface PageActionsContext {
    config: PageConfig;
    getCurrentCategoryId: () => string | number | null;
    onCategoryDeleted: () => void;
    onCategoryFormModalOpened: (reference: BsModalRef<ModalFormDialogComponent>) => void;
    onCategorySaved: () => void;
    onDeleted: () => void;
    onFormModalOpened: (reference: BsModalRef<ModalFormDialogComponent>) => void;
    onMoved: () => void;
    onSaved: () => void;
    onTrashItemDeleted: () => void;
    selectedItems: () => PageItem[];
}

interface BulkActionOptions<T> {
    confirm: boolean;
    key: string;
    mapPayload: (items: PageItem[]) => T;
    onComplete: () => void;
    request: (baseUrl: string, payload: T, successToast: string) => Observable<void>;
}

interface SaveEntityOptions {
    create: (baseUrl: string, value: unknown, successToast: string) => Observable<unknown>;
    edit: (baseUrl: string, id: string | number, value: unknown, successToast: string) => Observable<unknown>;
    entitySuffix: string;
    onSaved: () => void;

    afterCreate?: (created: PageItem) => Observable<unknown> | undefined;
}

@Injectable({
    providedIn: 'root'
})
export class PageActionsService {
    private readonly modalService = inject(ModalService);
    private readonly modalTreeService = inject(ModalTreeService);
    private readonly pageFormService = inject(PageFormService);
    private readonly pageHttpService = inject(PageHttpService);
    private readonly pageLifecycleActionsService = inject(PageLifecycleActionsService);
    private readonly pageUsagesService = inject(PageUsagesService);

    private readonly actionHandlers: Record<string, (context: PageActionsContext, action: PageAction) => void> = {
        [PageStandardAction.ChangeStatus]: context => this.executeChangeStatus(context),
        [PageStandardAction.Create]: context => this.executeCreate(context),
        [PageStandardAction.CreateCategory]: context => this.executeCreateCategory(context),
        [PageStandardAction.Delete]: (context, action) => this.executeDelete(context, action),
        [PageStandardAction.DeleteCategory]: (context, action) => this.executeDeleteCategory(context, action),
        [PageStandardAction.DeleteTrashItem]: (context, action) => this.executeDeleteTrashItem(context, action),
        [PageStandardAction.Duplicate]: context => this.executeDuplicate(context),
        [PageStandardAction.Edit]: context => this.executeEdit(context),
        [PageStandardAction.EditCategory]: context => this.executeEditCategory(context),
        [PageStandardAction.EmptyTrash]: (context, action) =>
            this.pageLifecycleActionsService.emptyTrash(context.config, action, () => context.onTrashItemDeleted()),
        [PageStandardAction.Move]: context => this.executeMove(context),
        [PageStandardAction.RestoreTrashItem]: context => this.executeRestoreTrashItem(context)
    };

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
                        subActions: action.subActions?.map(
                            subAction =>
                                new HeaderAction({
                                    action: () => execute(subAction),
                                    icon: subAction.icon,
                                    key: subAction.key,
                                    label: subAction.label,
                                    tooltip: subAction.tooltip,
                                    type: subAction.type
                                })
                        ),
                        tooltip: action.tooltip,
                        type: action.type
                    })
            );
    }

    executeAction(action: PageAction, context: PageActionsContext): void {
        if (action.handler) {
            action.handler(
                toHandlerItems(action, context.selectedItems(), context.config.tableConfig?.categoriesConfig)
            );

            return;
        }

        this.actionHandlers[action.key]?.(context, action);
    }

    filterVisibleActions(
        actions: PageAction[],
        allowedKeys: string[] | null,
        selectedItems: PageItem[],
        categoriesConfig?: PageCategoriesConfig
    ): PageAction[] {
        const visible: PageAction[] = [];

        for (const action of actions) {
            if (action.scope !== PageActionScope.Group) {
                if (isActionVisible(action, allowedKeys, selectedItems, categoriesConfig)) {
                    visible.push(action);
                }

                continue;
            }

            const visibleSubActions = this.filterVisibleActions(
                action.subActions ?? [],
                allowedKeys,
                selectedItems,
                categoriesConfig
            );

            if (visibleSubActions.length > 0) {
                visible.push(new PageAction({ ...action, subActions: visibleSubActions }));
            }
        }

        return visible;
    }

    moveItems(
        context: PageActionsContext,
        items: PageItem[],
        targetId: string | number | null,
        onMoved?: () => void
    ): void {
        const { baseUrl, prefix } = context.config;

        if (items.length === 0 || !baseUrl) {
            return;
        }

        this.pageHttpService
            .moveItems(baseUrl, toTrashItems(items), targetId, `${prefix}.toast.move-success`)
            .subscribe(() => {
                onMoved?.();
                context.onMoved();
            });
    }

    openEditForm(context: PageActionsContext, row: PageItem): void {
        if (isCategoryRow(row, context.config.tableConfig?.categoriesConfig)) {
            this.openCategoryForm(context, row);
        } else {
            this.openForm(context, row);
        }
    }

    openRequestForm<TValue>(
        config: ModalFormConfig<TValue>,
        submit: (value: TValue) => Observable<unknown>,
        onSaved: () => void
    ): void {
        this.pageFormService.openWithRequest(config, submit, onSaved);
    }

    private completeSave(handle: FormHandle, options: SaveEntityOptions): void {
        handle.close();
        options.onSaved();
    }

    private executeBulkAction<T>(
        context: PageActionsContext,
        options: BulkActionOptions<T>,
        action?: PageAction
    ): void {
        const items = context.selectedItems();
        const { baseUrl, prefix } = context.config;

        if (items.length === 0 || !baseUrl) {
            return;
        }

        const run = (): void => {
            options
                .request(baseUrl, options.mapPayload(items), `${prefix}.toast.${options.key}-success`)
                .subscribe(() => options.onComplete());
        };

        if (!options.confirm) {
            run();

            return;
        }

        const confirmation: ConfirmationModalConfig = {
            message: `${prefix}.modal.${options.key}.message`,
            messageParameters: { count: items.length },
            title: `${prefix}.modal.${options.key}.title`
        };

        this.pageUsagesService
            .confirmInUse(context.config, options.key, items, confirmation)
            .pipe(
                switchMap(config => toObservable(action?.confirmation?.(items, config) ?? config)),
                switchMap(config => this.modalService.openConfirmation(config))
            )
            .subscribe(confirmed => {
                if (confirmed) {
                    run();
                }
            });
    }

    private executeChangeStatus(context: PageActionsContext): void {
        const items = context.selectedItems();

        if (items.length === 1) {
            this.pageLifecycleActionsService.changeStatus(context.config, items[0], () => context.onSaved());
        }
    }

    private executeCreate(context: PageActionsContext): void {
        this.openForm(context);
    }

    private executeCreateCategory(context: PageActionsContext): void {
        this.openCategoryForm(context);
    }

    private executeDelete(context: PageActionsContext, action: PageAction): void {
        this.executeBulkAction(
            context,
            {
                confirm: true,
                key: 'delete',
                mapPayload: items => items.map(item => item.id),
                onComplete: () => context.onDeleted(),
                request: (baseUrl, ids, successToast) => this.pageHttpService.deleteItems(baseUrl, ids, successToast)
            },
            action
        );
    }

    private executeDeleteCategory(context: PageActionsContext, action: PageAction): void {
        this.executeBulkAction(
            context,
            {
                confirm: true,
                key: 'delete-category',
                mapPayload: items => items.map(item => item.id),
                onComplete: () => context.onCategoryDeleted(),
                request: (baseUrl, ids, successToast) =>
                    this.pageHttpService.deleteCategories(baseUrl, ids, successToast)
            },
            action
        );
    }

    private executeDeleteTrashItem(context: PageActionsContext, action: PageAction): void {
        this.executeBulkAction(
            context,
            {
                confirm: true,
                key: 'delete-trash-item',
                mapPayload: toTrashItems,
                onComplete: () => context.onTrashItemDeleted(),
                request: (baseUrl, items, successToast) =>
                    this.pageHttpService.deleteTrashItems(baseUrl, items, successToast)
            },
            action
        );
    }

    private executeDuplicate(context: PageActionsContext): void {
        const items = context.selectedItems();

        if (items.length === 1) {
            this.pageLifecycleActionsService.duplicate(context.config, items[0], () => context.onSaved());
        }
    }

    private executeEdit(context: PageActionsContext): void {
        const items = context.selectedItems();

        if (items.length === 1) {
            this.openForm(context, items[0]);
        }
    }

    private executeEditCategory(context: PageActionsContext): void {
        const items = context.selectedItems();

        if (items.length === 1) {
            this.openCategoryForm(context, items[0]);
        }
    }

    private executeMove(context: PageActionsContext): void {
        const items = context.selectedItems();
        const { baseUrl, prefix } = context.config;
        const categoriesConfig = context.config.tableConfig?.categoriesConfig;

        if (items.length === 0 || !baseUrl || !categoriesConfig) {
            return;
        }

        this.pageHttpService.loadCategoryTree(baseUrl, readMoveOwnerId(items)).subscribe(categories => {
            const reference = this.modalTreeService.open(
                new ModalTreeConfig<PageMoveTarget>({
                    nodes: buildMoveTargetNodes(prefix, categories, categoriesConfig, items),
                    prefix: `${prefix}.move`,
                    onConfirm: node => this.moveItems(context, items, node?.data?.id ?? null, () => reference.hide())
                })
            );
        });
    }

    private executeRestoreTrashItem(context: PageActionsContext): void {
        this.executeBulkAction(context, {
            confirm: false,
            key: 'restore-trash-item',
            mapPayload: toTrashItems,
            onComplete: () => context.onSaved(),
            request: (baseUrl, items, successToast) =>
                this.pageHttpService
                    .restoreTrashItems(baseUrl, items, successToast)
                    .pipe(map(renamed => this.pageLifecycleActionsService.reportRenamed(renamed)))
        });
    }

    private mergeParentField(context: PageActionsContext, value: unknown, original?: PageItem): unknown {
        const categoriesConfig = context.config.tableConfig?.categoriesConfig;

        if (original || !categoriesConfig) {
            return value;
        }

        return {
            ...(value as Record<string, unknown>),
            [categoriesConfig.parentField]: context.getCurrentCategoryId()
        };
    }

    private openCategoryForm(context: PageActionsContext, item?: PageItem): void {
        const categoriesConfig = context.config.tableConfig?.categoriesConfig;

        if (!categoriesConfig) {
            return;
        }

        const categoriesForm = categoriesConfig.formConfig;

        this.openEntityForm(context, categoriesForm, categoriesForm?.prefix ?? '', item, (value, handle) =>
            this.saveCategories(context, value, handle, item)
        );
    }

    private openEntityForm(
        context: PageActionsContext,
        formConfig: PageFormConfig | undefined,
        prefix: string,
        item: PageItem | undefined,
        save: (value: unknown, handle: FormHandle) => void
    ): void {
        if (!formConfig) {
            return;
        }

        const reference = this.pageFormService.open(formConfig, item, prefix, save);

        context.onFormModalOpened(reference);
    }

    private openForm(context: PageActionsContext, item?: PageItem): void {
        this.openEntityForm(context, context.config.formConfig, context.config.prefix, item, (value, handle) =>
            this.save(context, value, handle, item)
        );
    }

    private save(context: PageActionsContext, value: unknown, handle: FormHandle, original?: PageItem): void {
        this.saveEntity(context, this.mergeParentField(context, value, original), handle, original, {
            afterCreate: created => context.config.formConfig?.afterCreate?.(created),
            create: (baseUrl, entityValue, successToast) =>
                this.pageHttpService.create(baseUrl, entityValue, successToast),
            edit: (baseUrl, id, entityValue, successToast) =>
                this.pageHttpService.edit(baseUrl, id, entityValue, successToast),
            entitySuffix: '',
            onSaved: () => context.onSaved()
        });
    }

    private saveCategories(context: PageActionsContext, value: unknown, handle: FormHandle, original?: PageItem): void {
        this.saveEntity(context, this.mergeParentField(context, value, original), handle, original, {
            create: (baseUrl, entityValue, successToast) =>
                this.pageHttpService.createCategory(baseUrl, entityValue, successToast),
            edit: (baseUrl, id, entityValue, successToast) =>
                this.pageHttpService.editCategory(baseUrl, id, entityValue, successToast),
            entitySuffix: '-category',
            onSaved: () => context.onCategorySaved()
        });
    }

    private saveEntity(
        context: PageActionsContext,
        value: unknown,
        handle: FormHandle,
        original: PageItem | undefined,
        options: SaveEntityOptions
    ): void {
        const { baseUrl, prefix } = context.config;

        if (!baseUrl) {
            handle.close();

            return;
        }

        const successToast = `${prefix}.toast.${original ? 'edit' : 'create'}${options.entitySuffix}-success`;
        const request = original
            ? options.edit(baseUrl, original.id, value, successToast)
            : options.create(baseUrl, value, successToast);

        request.subscribe(created => {
            const followUp = original ? undefined : options.afterCreate?.(created as PageItem);

            if (!followUp) {
                this.completeSave(handle, options);

                return;
            }

            followUp.subscribe(() => this.completeSave(handle, options));
        });
    }
}

function toObservable<T>(value: T | Observable<T>): Observable<T> {
    return isObservable(value) ? value : of(value);
}
