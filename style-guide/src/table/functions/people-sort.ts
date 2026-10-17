import { BeyTableSort, BeyTableSortDirection } from '@beyonda-labs/angular-components';

import { Person } from '../models/table-style-guide.model';

export function sortPeople(people: Person[], sort: BeyTableSort | null): Person[] {
    if (!sort) {
        return people;
    }

    const field = sort.field as 'joinedAt' | 'name' | 'role';
    const factor = sort.direction === BeyTableSortDirection.Desc ? -1 : 1;

    return [...people].sort(
        (first, second) => factor * String(first[field] ?? '').localeCompare(String(second[field] ?? ''))
    );
}
