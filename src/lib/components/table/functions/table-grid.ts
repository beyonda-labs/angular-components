import { TableColumn } from '../models/table.model';

export function toGridTrack({ width }: TableColumn): string {
    return typeof width === 'number' ? `minmax(0, ${Math.max(width, 1)}fr)` : width;
}
