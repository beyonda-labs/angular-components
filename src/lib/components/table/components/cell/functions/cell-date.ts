import { formatDate } from '@angular/common';

import { DateTableCell } from '../../../models/table-cell.model';

export function toDateText({ format, value }: DateTableCell, locale: string): string {
    return value === null || value === undefined || value === '' ? '' : formatDate(value, format, locale);
}
