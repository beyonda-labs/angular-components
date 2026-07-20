import { PageAction } from './page-action.model';

export class PageHeaderConfig {
    actions: PageAction[];

    title?: string;

    constructor({ actions = [], title }: PageHeaderConfigParameters) {
        this.actions = actions;
        this.title = title;
    }
}

export interface PageHeaderConfigParameters {
    actions?: PageAction[];
    title?: string;
}
