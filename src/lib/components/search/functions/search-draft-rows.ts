import { SearchConfig, SearchField, SearchFieldType } from '../models/search.model';
import { SearchDraftRow } from '../models/search-draft.model';
import {
    BooleanFilter,
    BooleanFilterOperator,
    NumberFilter,
    NumberFilterOperator,
    SearchFilter,
    SearchFilterOperator,
    StringFilter,
    StringFilterOperator
} from '../models/search-filter.model';
import { dateInputValue, dayEnd, dayStart } from './search-dates';

const TERM_TYPES = new Set<SearchFieldType>([SearchFieldType.Number, SearchFieldType.Tags, SearchFieldType.Text]);

export function emptySearchRow(fieldKey: string, operator: SearchFilterOperator | '' = ''): SearchDraftRow {
    return { fieldKey, operator, value: '', valueLabel: '', valueTo: '' };
}

export function findMainTerm({ fields, filters, mainField }: SearchConfig): string {
    const field = fields.find(current => current.key === mainField);
    const filter = filters.find(current => current.field === mainField);

    if (!field || !filter || !TERM_TYPES.has(field.type)) {
        return '';
    }

    return String(filter.value ?? '');
}

export function isBetweenRow({ operator }: Pick<SearchDraftRow, 'operator'>): boolean {
    return operator === SearchFilterOperator.Between;
}

export function isSearchRowValid(row: SearchDraftRow, field: SearchField | undefined): boolean {
    if (!field || !row.operator) {
        return false;
    }

    switch (field.type) {
        case SearchFieldType.Boolean:
            return row.value === 'true' || row.value === 'false';

        case SearchFieldType.Date:
            return isBetweenRow(row)
                ? dayStart(row.value) !== null && dayEnd(row.valueTo) !== null
                : dayStart(row.value) !== null;

        case SearchFieldType.Number:
            if (isBetweenRow(row)) {
                return isNumeric(row.value) && isNumeric(row.valueTo);
            }

            return isNumeric(row.value);

        default:
            return row.value.trim().length > 0;
    }
}

export function searchLabelKey(fieldKey: string, value: string): string {
    return `${fieldKey}:${value}`;
}

export function searchTermOf(row: SearchDraftRow | undefined, field: SearchField | undefined): string {
    return row && field && TERM_TYPES.has(field.type) ? row.value : '';
}

export function toSearchDraftRow(
    { field, operator, value }: SearchFilter,
    fields: SearchField[],
    labels: ReadonlyMap<string, string>
): SearchDraftRow {
    const [from, to] = Array.isArray(value) ? value : [value, ''];
    const searchField = fields.find(current => current.key === field);

    if (searchField?.type === SearchFieldType.Date) {
        return { ...emptySearchRow(field, operator), value: dateInputValue(from), valueTo: dateInputValue(to) };
    }

    const text = String(from ?? '');
    const valueLabel =
        searchField?.type === SearchFieldType.Autocomplete
            ? (labels.get(searchLabelKey(field, text)) ??
              searchField.options?.find(option => option.value === text)?.label ??
              text)
            : '';

    return { fieldKey: field, operator, value: text, valueLabel, valueTo: String(to ?? '') };
}

export function toSearchFilter(row: SearchDraftRow, field: SearchField): SearchFilter {
    switch (field.type) {
        case SearchFieldType.Boolean:
            return new BooleanFilter({
                field: field.key,
                operator: row.operator as BooleanFilterOperator,
                value: row.value === 'true'
            });

        case SearchFieldType.Date:
            return new NumberFilter({
                field: field.key,
                operator: row.operator as NumberFilterOperator,
                value: toDateFilterValue(row)
            });

        case SearchFieldType.Number:
            return new NumberFilter({
                field: field.key,
                operator: row.operator as NumberFilterOperator,
                value: isBetweenRow(row) ? [Number(row.value), Number(row.valueTo)] : Number(row.value)
            });

        default:
            return new StringFilter({
                field: field.key,
                operator: row.operator as StringFilterOperator,
                value: row.value.trim()
            });
    }
}

function isNumeric(value: string): boolean {
    return value.trim().length > 0 && !Number.isNaN(Number(value));
}

function toDateFilterValue({ operator, value, valueTo }: SearchDraftRow): number | [number, number] {
    switch (operator) {
        case SearchFilterOperator.Between:
            return [dayStart(value) ?? 0, dayEnd(valueTo) ?? 0];

        case SearchFilterOperator.LessThanOrEquals:
            return dayEnd(value) ?? 0;

        default:
            return dayStart(value) ?? 0;
    }
}
