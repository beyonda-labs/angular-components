import { PageSearch } from '../models/page-search.model';

export function hasSearchCriteria(search: PageSearch, textField?: string): boolean {
    const { filters, text } = withSearchText(search, textField);

    return Boolean(text) || filters.length > 0;
}

export function withSearchText(search: PageSearch, textField?: string): PageSearch {
    if (!textField) {
        return search;
    }

    const filters = search.filters.filter(filter => filter.field !== textField);
    const value = search.filters.find(filter => filter.field === textField)?.value;
    const text = typeof value === 'string' ? value.trim() : '';

    return text ? { ...search, filters, text } : { ...search, filters };
}
