import { HeaderActionType } from '../../header/models/header.model';
import {
    PAGE_ADD_ACTION_DEFAULTS,
    PAGE_STANDARD_ACTION_DEFAULTS,
    PageAction,
    PageActionParameters,
    PageStandardAction
} from '../models/page-action.model';
import { PageItem } from '../models/page-item.model';

const ADD_GROUP_ENTRIES = [PageStandardAction.Create, PageStandardAction.CreateCategory];

export function pageAddAction<TItem extends PageItem = PageItem>(
    overrides: Partial<PageActionParameters<TItem>> = {}
): PageAction<TItem> {
    return new PageAction<TItem>({
        ...PAGE_ADD_ACTION_DEFAULTS,
        subActions: ADD_GROUP_ENTRIES.map(key =>
            pageStandardAction<TItem>(key, { icon: undefined, type: HeaderActionType.Text })
        ),
        ...overrides
    });
}

export function pageStandardAction<TItem extends PageItem = PageItem>(
    key: PageStandardAction,
    overrides: Partial<Omit<PageActionParameters<TItem>, 'key'>> = {}
): PageAction<TItem> {
    return new PageAction<TItem>({ ...PAGE_STANDARD_ACTION_DEFAULTS[key], ...overrides, key });
}
