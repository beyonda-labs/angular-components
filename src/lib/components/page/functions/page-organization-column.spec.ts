import { TableColumn } from '../../table/models/table.model';
import {
    hasOrganizationColumn,
    hiddenOrganizationColumn,
    pageOrganizationCell,
    pageOrganizationColumn,
    withoutColumn
} from './page-organization-column';

const ORGANIZATIONS = [
    { id: 'o1', name: 'Acme' },
    { id: 'o2', name: 'Globex' }
];

describe('pageOrganizationColumn', () => {
    it('shows the organization name under the library header, hideable and not sortable', () => {
        expect(pageOrganizationColumn()).toMatchObject({
            isHideable: true,
            isSortable: false,
            isVisible: true,
            key: 'organizationName',
            label: 'angular-components.page.table.columns.organization-name',
            tooltip: 'angular-components.page.table.tooltips.organization-name',
            width: 2
        });
    });

    it('takes what the page wants otherwise, such as a sort its backend offers', () => {
        expect(pageOrganizationColumn({ isSortable: true, width: 3 })).toMatchObject({
            isSortable: true,
            key: 'organizationName',
            sortField: 'organizationName',
            width: 3
        });
    });
});

describe('pageOrganizationCell', () => {
    it('shows the name of the organization, untranslated, with it as the tooltip', () => {
        expect(pageOrganizationCell({ organizationName: 'Acme' })).toMatchObject({
            content: 'Acme',
            tooltip: 'Acme',
            translate: false
        });
    });

    it('stays empty for a common row or a row that carries no organization', () => {
        expect(pageOrganizationCell({ organizationName: null })).toMatchObject({ content: '', tooltip: undefined });
        expect(pageOrganizationCell({})).toMatchObject({ content: '', tooltip: undefined });
    });
});

describe('hasOrganizationColumn', () => {
    it('tells whether the columns hold the organization column', () => {
        expect(hasOrganizationColumn([new TableColumn({ key: 'name' }), pageOrganizationColumn()])).toBe(true);
        expect(hasOrganizationColumn([new TableColumn({ key: 'name' })])).toBe(false);
    });
});

describe('hiddenOrganizationColumn', () => {
    const columns = [new TableColumn({ key: 'name' }), pageOrganizationColumn(), new TableColumn({ key: 'status' })];

    it('hides the organization column while there are fewer than two organizations', () => {
        expect(hiddenOrganizationColumn(columns, [])).toBe(1);
        expect(hiddenOrganizationColumn(columns, [ORGANIZATIONS[0]])).toBe(1);
    });

    it('hides nothing with two organizations or more, or without the column', () => {
        expect(hiddenOrganizationColumn(columns, ORGANIZATIONS)).toBe(-1);
        expect(hiddenOrganizationColumn([new TableColumn({ key: 'name' })], [])).toBe(-1);
    });
});

describe('withoutColumn', () => {
    it('leaves out the entry of the hidden column, and keeps every entry when none is hidden', () => {
        expect(withoutColumn(['name', 'organization', 'status'], 1)).toEqual(['name', 'status']);
        expect(withoutColumn(['name', 'status'], -1)).toEqual(['name', 'status']);
        expect(withoutColumn(['name'], 1)).toEqual(['name']);
    });
});
