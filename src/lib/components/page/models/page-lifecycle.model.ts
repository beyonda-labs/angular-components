import { FormFieldValidator } from '../../form/models/form-field-validator.model';

export const PAGE_LIFECYCLE_FORM_SECTION = 'main';

export type PageLifecycleFormValue = Record<typeof PAGE_LIFECYCLE_FORM_SECTION, Record<string, string>>;

export class PageDuplicationConfig {
    copySeparator: string;
    nameField: string;
    nameValidators: FormFieldValidator[];

    constructor({
        copySeparator = ' ',
        nameField = 'name',
        nameValidators = []
    }: PageDuplicationConfigParameters = {}) {
        this.copySeparator = copySeparator;
        this.nameField = nameField;
        this.nameValidators = nameValidators;
    }
}

export class PageStatusConfig {
    field: string;
    transitions: Readonly<Record<string, readonly string[]>>;

    constructor({ field = 'status', transitions }: PageStatusConfigParameters) {
        this.field = field;
        this.transitions = transitions;
    }
}

export interface PageDuplicationConfigParameters {
    copySeparator?: string;
    nameField?: string;
    nameValidators?: FormFieldValidator[];
}

export interface PageStatusConfigParameters {
    transitions: Readonly<Record<string, readonly string[]>>;

    field?: string;
}
