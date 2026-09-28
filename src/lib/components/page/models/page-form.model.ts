import { Observable } from 'rxjs';

import { FormHandle, FormSection } from '../../form/models/form.model';
import { PageItem } from './page-item.model';

export type PageSaveMode = 'create' | 'edit';

export class PageFormConfig<TValue = unknown, TItem extends PageItem = PageItem> {
    allowSubmitWithoutChanges: boolean;
    buildSections: (item?: TItem) => FormSection[];
    prefix: string;
    toFormValue: (item?: TItem) => TValue | undefined;
    toItem: (value: TValue) => unknown;

    afterCreate?: (created: TItem) => Observable<unknown> | undefined;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;

    constructor({
        afterCreate,
        allowSubmitWithoutChanges = false,
        buildSections,
        onCreate,
        onEdit,
        onReady,
        onValueChange,
        prefix,
        toFormValue = (item?: TItem) => item as unknown as TValue | undefined,
        toItem = (value: TValue) => value
    }: PageFormConfigParameters<TValue, TItem>) {
        this.afterCreate = afterCreate;
        this.allowSubmitWithoutChanges = allowSubmitWithoutChanges;
        this.buildSections = buildSections;
        this.onCreate = onCreate;
        this.onEdit = onEdit;
        this.onReady = onReady;
        this.onValueChange = onValueChange;
        this.prefix = prefix;
        this.toFormValue = toFormValue;
        this.toItem = toItem;
    }
}

export interface PageFormConfigParameters<TValue = unknown, TItem extends PageItem = PageItem> {
    buildSections: (item?: TItem) => FormSection[];
    prefix: string;

    afterCreate?: (created: TItem) => Observable<unknown> | undefined;
    allowSubmitWithoutChanges?: boolean;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;
    toFormValue?: (item?: TItem) => TValue | undefined;
    toItem?: (value: TValue) => unknown;
}
