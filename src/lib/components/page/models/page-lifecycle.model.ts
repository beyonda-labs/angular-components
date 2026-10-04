export const PAGE_LIFECYCLE_FORM_SECTION = 'main';

export type PageLifecycleFormValue = Record<typeof PAGE_LIFECYCLE_FORM_SECTION, Record<string, string>>;

export class PageDuplicationConfig {
    nameField: string;

    constructor({ nameField = 'name' }: PageDuplicationConfigParameters = {}) {
        this.nameField = nameField;
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
    nameField?: string;
}

export interface PageStatusConfigParameters {
    transitions: Readonly<Record<string, readonly string[]>>;

    field?: string;
}
