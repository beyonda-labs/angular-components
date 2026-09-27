import { inject, Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

import { ModalFormDialogComponent } from '../../form/components/modal/internal/modal-form-dialog.component';
import { FormHandle } from '../../form/models/form.model';
import { HeaderAction } from '../../header/models/header.model';
import { ModalService } from '../../modal/services/modal.service';
import { ModalTreeConfig } from '../../tree/components/modal/models/modal-tree.model';
import { ModalTreeService } from '../../tree/components/modal/services/modal-tree.service';
import { TreeNode } from '../../tree/models/tree.model';
import { PageConfig } from '../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../models/page-action.model';
import { PageCategoriesConfig, PageItemType, PageTrashItem } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';

interface MoveTargetData {
    id: string | number | null;
}

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
    private readonly actionHandlers: Record<string, (context: PageActionsContext) => void> = {
        [PageStandardAction.Create]: context => this.executeCreate(context),
        [PageStandardAction.CreateCategory]: context => this.executeCreateCategory(context),
        [PageStandardAction.Delete]: context => this.executeDelete(context),
        [PageStandardAction.DeleteCategory]: context => this.executeDeleteCategory(context),
        [PageStandardAction.DeleteTrashItem]: context => this.executeDeleteTrashItem(context),
        [PageStandardAction.Edit]: context => this.executeEdit(context),
        [PageStandardAction.EditCategory]: context => this.executeEditCategory(context),
        [PageStandardAction.Move]: context => this.executeMove(context),
        [PageStandardAction.RestoreTrashItem]: context => this.executeRestoreTrashItem(context)
    };

    private readonly modalService = inject(ModalService);
    private readonly modalTreeService = inject(ModalTreeService);
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
            action.handler(action.scope === PageActionScope.Item ? context.selectedItems() : undefined);

            return;
        }

        this.actionHandlers[action.key]?.(context);
    }

    filterVisibleActions(actions: PageAction[], allowedKeys: string[] | null, selectedItems: PageItem[]): PageAction[] {
        const visible: PageAction[] = [];

        for (const action of actions) {
            if (action.scope !== PageActionScope.Group) {
                if (this.isActionVisible(action, allowedKeys, selectedItems)) {
                    visible.push(action);
                }

                continue;
            }

            const visibleSubActions = this.filterVisibleActions(action.subActions ?? [], allowedKeys, selectedItems);

            if (visibleSubActions.length > 0) {
                visible.push(new PageAction({ ...action, subActions: visibleSubActions }));
            }
        }

        return visible;
    }

    private buildMoveTreeNodes(
        prefix: string,
        categories: PageItem[],
        categoriesConfig: PageCategoriesConfig,
        selectedItems: PageItem[]
    ): TreeNode<MoveTargetData>[] {
        const { nameField, parentField } = categoriesConfig;
        const childrenByParent = new Map<string | number | null, PageItem[]>();

        for (const category of categories) {
            const parentId =
                ((category as unknown as Record<string, unknown>)[parentField] as string | number | null) ?? null;
            const siblings = childrenByParent.get(parentId) ?? [];

            siblings.push(category);
            childrenByParent.set(parentId, siblings);
        }

        const blockedIds = new Set<string | number>(
            selectedItems.filter(item => (item as PageTrashItem).type === PageItemType.Category).map(item => item.id)
        );
        let frontier = [...blockedIds];

        while (frontier.length > 0) {
            const next: (string | number)[] = [];

            for (const id of frontier) {
                for (const child of childrenByParent.get(id) ?? []) {
                    if (!blockedIds.has(child.id)) {
                        blockedIds.add(child.id);
                        next.push(child.id);
                    }
                }
            }

            frontier = next;
        }

        const buildLevel = (parentId: string | number | null): TreeNode<MoveTargetData>[] =>
            (childrenByParent.get(parentId) ?? []).map(
                category =>
                    new TreeNode<MoveTargetData>({
                        key: String(category.id),
                        label: String((category as unknown as Record<string, unknown>)[nameField] ?? ''),
                        isDisabled: blockedIds.has(category.id),
                        data: { id: category.id },
                        children: buildLevel(category.id)
                    })
            );

        return [
            new TreeNode<MoveTargetData>({
                key: '__root__',
                label: `${prefix}.categories.root`,
                data: { id: null },
                children: buildLevel(null)
            })
        ];
    }

    private completeSave(handle: FormHandle, options: SaveEntityOptions): void {
        handle.close();
        options.onSaved();
    }

    private executeBulkAction<T>(context: PageActionsContext, options: BulkActionOptions<T>): void {
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

        this.modalService
            .openConfirmation({
                message: `${prefix}.modal.${options.key}.message`,
                messageParameters: { count: items.length },
                title: `${prefix}.modal.${options.key}.title`
            })
            .subscribe(confirmed => {
                if (confirmed) {
                    run();
                }
            });
    }

    private executeCreate(context: PageActionsContext): void {
        this.openForm(context);
    }

    private executeCreateCategory(context: PageActionsContext): void {
        this.openCategoryForm(context);
    }

    private executeDelete(context: PageActionsContext): void {
        this.executeBulkAction(context, {
            confirm: true,
            key: 'delete',
            mapPayload: items => items.map(item => item.id),
            onComplete: () => context.onDeleted(),
            request: (baseUrl, ids, successToast) => this.pageHttpService.deleteItems(baseUrl, ids, successToast)
        });
    }

    private executeDeleteCategory(context: PageActionsContext): void {
        this.executeBulkAction(context, {
            confirm: true,
            key: 'delete-category',
            mapPayload: items => items.map(item => item.id),
            onComplete: () => context.onCategoryDeleted(),
            request: (baseUrl, ids, successToast) => this.pageHttpService.deleteCategories(baseUrl, ids, successToast)
        });
    }

    private executeDeleteTrashItem(context: PageActionsContext): void {
        this.executeBulkAction(context, {
            confirm: true,
            key: 'delete-trash-item',
            mapPayload: toTrashItems,
            onComplete: () => context.onTrashItemDeleted(),
            request: (baseUrl, items, successToast) =>
                this.pageHttpService.deleteTrashItems(baseUrl, items, successToast)
        });
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

        this.pageHttpService.loadCategoryTree(baseUrl).subscribe(categories => {
            const reference = this.modalTreeService.open(
                new ModalTreeConfig<MoveTargetData>({
                    nodes: this.buildMoveTreeNodes(prefix, categories, categoriesConfig, items),
                    prefix: `${prefix}.move`,
                    onConfirm: node => {
                        const targetId = node?.data?.id ?? null;

                        this.pageHttpService
                            .moveItems(baseUrl, toTrashItems(items), targetId, `${prefix}.toast.move-success`)
                            .subscribe(() => {
                                reference.hide();
                                context.onMoved();
                            });
                    }
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
                this.pageHttpService.restoreTrashItems(baseUrl, items, successToast)
        });
    }

    private isActionVisible(action: PageAction, allowedKeys: string[] | null, selectedItems: PageItem[]): boolean {
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

function toTrashItems(items: PageItem[]): PageTrashItem[] {
    return items.map(item => {
        const { id, type } = item as PageTrashItem;

        return { id, type };
    });
}
