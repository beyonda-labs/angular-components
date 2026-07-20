import { FormGroup } from '@angular/forms';

import { FormConfig, FormSection, FormStep } from '../../form/models/form.model';
import { PageItem } from './page-item.model';

export type PageSaveMode = 'create' | 'edit';

export class PageFormConfig<TValue = unknown> {
    buildSections: (item?: PageItem) => FormSection[];
    prefix: string;
    steps: FormStep[];
    toFormValue: (item?: PageItem) => TValue | undefined;
    toItem: (value: TValue) => unknown;

    onCreate?: (value: TValue, form: FormConfig<TValue>) => void;
    onEdit?: (value: TValue, form: FormConfig<TValue>) => void;
    onFormGroupAdded?: (formGroup: FormGroup, form: FormConfig<TValue>) => void;

    constructor({
        buildSections,
        onCreate,
        onEdit,
        onFormGroupAdded,
        prefix,
        steps = [],
        toFormValue = (item?: PageItem) => item as TValue | undefined,
        toItem = (value: TValue) => value
    }: PageFormConfigParameters<TValue>) {
        this.buildSections = buildSections;
        this.onCreate = onCreate;
        this.onEdit = onEdit;
        this.onFormGroupAdded = onFormGroupAdded;
        this.prefix = prefix;
        this.steps = steps;
        this.toFormValue = toFormValue;
        this.toItem = toItem;
    }
}

export interface PageFormConfigParameters<TValue = unknown> {
    buildSections: (item?: PageItem) => FormSection[];
    prefix: string;

    onCreate?: (value: TValue, form: FormConfig<TValue>) => void;
    onEdit?: (value: TValue, form: FormConfig<TValue>) => void;
    onFormGroupAdded?: (formGroup: FormGroup, form: FormConfig<TValue>) => void;
    steps?: FormStep[];
    toFormValue?: (item?: PageItem) => TValue | undefined;
    toItem?: (value: TValue) => unknown;
}
