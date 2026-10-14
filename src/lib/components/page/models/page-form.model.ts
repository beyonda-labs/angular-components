import { Observable } from 'rxjs';

import { ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormHandle, FormSection } from '../../form/models/form.model';
import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { PageItem } from './page-item.model';
import { PageCategoryPathEntry } from './page-state.model';

export type PageSaveConfirmation<TValue = unknown, TItem extends PageItem = PageItem> = (
    value: TValue,
    item?: TItem
) => ConfirmationModalConfig | null | Observable<ConfirmationModalConfig | null>;

export type PageSaveMode = 'create' | 'edit';

export class PageFormConfig<TValue = unknown, TItem extends PageItem = PageItem> {
    buildSections: (item?: TItem, category?: PageCategoryPathEntry) => FormSection[];
    canSubmitWithoutChanges: boolean;
    prefix: string;
    size: ModalFormSize;
    toFormValue: (item?: TItem, category?: PageCategoryPathEntry) => TValue | undefined;
    toItem: (value: TValue, item?: TItem) => unknown;

    afterCreate?: (created: TItem) => Observable<unknown> | undefined;
    confirmSave?: PageSaveConfirmation<TValue, TItem>;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;

    constructor({
        afterCreate,
        buildSections,
        canSubmitWithoutChanges = false,
        confirmSave,
        onCreate,
        onEdit,
        onReady,
        onValueChange,
        prefix,
        size = ModalFormSize.Large,
        toFormValue = (item?: TItem) => item as unknown as TValue | undefined,
        toItem = (value: TValue) => value
    }: PageFormConfigParameters<TValue, TItem>) {
        this.afterCreate = afterCreate;
        this.buildSections = buildSections;
        this.canSubmitWithoutChanges = canSubmitWithoutChanges;
        this.confirmSave = confirmSave;
        this.onCreate = onCreate;
        this.onEdit = onEdit;
        this.onReady = onReady;
        this.onValueChange = onValueChange;
        this.prefix = prefix;
        this.size = size;
        this.toFormValue = toFormValue;
        this.toItem = toItem;
    }
}

export interface PageFormConfigParameters<TValue = unknown, TItem extends PageItem = PageItem> {
    buildSections: (item?: TItem, category?: PageCategoryPathEntry) => FormSection[];
    prefix: string;

    afterCreate?: (created: TItem) => Observable<unknown> | undefined;
    canSubmitWithoutChanges?: boolean;
    confirmSave?: PageSaveConfirmation<TValue, TItem>;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;
    size?: ModalFormSize;
    toFormValue?: (item?: TItem, category?: PageCategoryPathEntry) => TValue | undefined;
    toItem?: (value: TValue, item?: TItem) => unknown;
}

export const PAGE_FORM_CANCEL_LABEL = 'angular-components.page.form.cancel';

export const PAGE_FORM_SUBMIT_LABEL = 'angular-components.page.form.submit';
