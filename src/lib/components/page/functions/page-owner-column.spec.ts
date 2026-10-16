import { pageOwnerCell, pageOwnerColumn } from './page-owner-column';

describe('pageOwnerColumn', () => {
    it('shows the owner name under the library header and sorts by the owner id', () => {
        expect(pageOwnerColumn()).toMatchObject({
            isHideable: true,
            isSortable: true,
            isVisible: true,
            key: 'ownerName',
            label: 'angular-components.page.table.columns.owner-name',
            sortField: 'ownerId',
            tooltip: 'angular-components.page.table.tooltips.owner-name',
            width: 2
        });
    });

    it('takes what the page wants otherwise', () => {
        expect(pageOwnerColumn({ isVisible: false, width: 3 })).toMatchObject({
            isVisible: false,
            key: 'ownerName',
            width: 3
        });
    });
});

describe('pageOwnerCell', () => {
    it('shows the display name of the owner, untranslated, with it as the tooltip', () => {
        expect(pageOwnerCell({ ownerName: 'Ada Lovelace' })).toMatchObject({
            content: 'Ada Lovelace',
            tooltip: 'Ada Lovelace',
            isTranslationKey: false
        });
    });

    it('stays empty for a row nobody owns', () => {
        expect(pageOwnerCell({ ownerId: null, ownerName: null })).toMatchObject({ content: '', tooltip: undefined });
        expect(pageOwnerCell({ ownerName: null })).toMatchObject({ content: '', tooltip: undefined });
    });

    it('names as unknown an owner whose name resolves to nothing', () => {
        expect(pageOwnerCell({ ownerId: 'u1', ownerName: null })).toMatchObject({
            content: 'angular-components.user-name.unknown',
            isTranslationKey: true
        });
    });
});
