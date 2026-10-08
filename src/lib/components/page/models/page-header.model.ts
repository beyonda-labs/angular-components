import { PageAction } from './page-action.model';
import { PageItem } from './page-item.model';

export class PageHeaderConfig<TItem extends PageItem = PageItem> {
    actions: PageAction<TItem>[];

    title?: string;

    constructor({ actions = [], title }: PageHeaderConfigParameters<TItem>) {
        this.actions = actions;
        this.title = title;
    }
}

export interface PageHeaderConfigParameters<TItem extends PageItem = PageItem> {
    actions?: PageAction<TItem>[];
    title?: string;
}
