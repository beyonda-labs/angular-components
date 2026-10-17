import { BeyTableSortDirection } from '@beyonda-labs/angular-components';

import { Person } from '../models/table-style-guide.model';
import { sortPeople } from './people-sort';

const ADA: Person = { id: 1, name: 'Ada', role: 'Engineer', skills: [], status: 'active' };
const GRACE: Person = { id: 2, name: 'Grace', role: 'Admiral', skills: [], status: 'review' };
const PEOPLE = [GRACE, ADA];

describe('sortPeople', () => {
    it('keeps the people as they come without a sort', () => {
        expect(sortPeople(PEOPLE, null)).toBe(PEOPLE);
    });

    it('sorts by the field of the sort, in its direction, leaving the list given as it was', () => {
        expect(sortPeople(PEOPLE, { direction: BeyTableSortDirection.Asc, field: 'name' })).toEqual([ADA, GRACE]);
        expect(sortPeople(PEOPLE, { direction: BeyTableSortDirection.Desc, field: 'role' })).toEqual([ADA, GRACE]);
        expect(PEOPLE).toEqual([GRACE, ADA]);
    });
});
