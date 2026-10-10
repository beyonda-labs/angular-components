import { toKeySegment } from '../../../utilities/key-segment';
import { TableColumn } from '../../table/models/table.model';

export function withColumnTooltips(columns: TableColumn[], tablePrefix: string): TableColumn[] {
    return columns.map(
        column =>
            new TableColumn({
                ...column,
                tooltip: column.tooltip ?? `${tablePrefix}.tooltips.${toKeySegment(column.key)}`
            })
    );
}
