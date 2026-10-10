import { toKeySegment } from '../../../utilities/key-segment';
import { TableColumn, TableColumnChoices, TableColumnsMenuEntry, VisibleTableColumn } from '../models/table.model';

export function buildColumnsMenuEntries(
    columns: TableColumn[],
    choices: TableColumnChoices,
    prefix: string
): TableColumnsMenuEntry[] {
    const visible = resolveVisibleColumns(columns, choices);

    return columns
        .filter(column => column.isHideable)
        .map(column => {
            const isChecked = visible.some(entry => entry.column === column);

            return {
                isChecked,
                isDisabled: isChecked && visible.length === 1,
                key: column.key,
                label: column.label ?? `${prefix}.columns.${toKeySegment(column.key)}`
            };
        });
}

export function resolveVisibleColumns(columns: TableColumn[], choices: TableColumnChoices): VisibleTableColumn[] {
    const indexed = columns.map((column, index) => ({ column, index }));
    const chosen = indexed.filter(({ column }) => !column.isHideable || (choices[column.key] ?? column.isVisible));

    if (chosen.length > 0) {
        return chosen;
    }

    const defaults = indexed.filter(({ column }) => !column.isHideable || column.isVisible);

    return defaults.length > 0 ? defaults : indexed.slice(0, 1);
}

export function toColumnChoices(value: unknown): TableColumnChoices {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {};
    }

    return Object.fromEntries(Object.entries(value).filter(([, isShown]) => typeof isShown === 'boolean'));
}

export function toggleColumnChoice(
    columns: TableColumn[],
    choices: TableColumnChoices,
    key: string
): TableColumnChoices {
    const column = columns.find(current => current.key === key);

    if (!column?.isHideable) {
        return choices;
    }

    const visible = resolveVisibleColumns(columns, choices);
    const isShown = visible.some(entry => entry.column === column);

    if (isShown && visible.length === 1) {
        return choices;
    }

    return { ...choices, [key]: !isShown };
}
