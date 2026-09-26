import { Observable } from 'rxjs';

import { FormHandle, FormSection } from '../../form/models/form.model';
import { PageItem } from './page-item.model';

export type PageSaveMode = 'create' | 'edit';

export class PageFormConfig<TValue = unknown> {
    allowSubmitWithoutChanges: boolean;
    buildSections: (item?: PageItem) => FormSection[];
    prefix: string;
    toFormValue: (item?: PageItem) => TValue | undefined;
    toItem: (value: TValue) => unknown;

    afterCreate?: (created: PageItem) => Observable<unknown> | undefined;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;

    constructor({
        afterCreate,
        buildSections,
        allowSubmitWithoutChanges = false,
        onCreate,
        onEdit,
        onReady,
        onValueChange,
        prefix,
        toFormValue = (item?: PageItem) => item as TValue | undefined,
        toItem = (value: TValue) => value
    }: PageFormConfigParameters<TValue>) {
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

export interface PageFormConfigParameters<TValue = unknown> {
    buildSections: (item?: PageItem) => FormSection[];
    prefix: string;

    afterCreate?: (created: PageItem) => Observable<unknown> | undefined;
    allowSubmitWithoutChanges?: boolean;
    onCreate?: (value: TValue, handle: FormHandle<TValue>) => void;
    onEdit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;
    toFormValue?: (item?: PageItem) => TValue | undefined;
    toItem?: (value: TValue) => unknown;
}
