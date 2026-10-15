import { PageOwnedItem } from '../models/page-owner.model';
import { readTransferOwners } from './page-transfer-owners';

describe('readTransferOwners', () => {
    it('answers each owner of the rows once, in the order the rows name them', () => {
        const rows: PageOwnedItem[] = [
            { id: 1, ownerId: 'u1', ownerName: 'Ada Lovelace' },
            { id: 2, ownerId: 'u2', ownerName: null },
            { id: 3, ownerId: 'u1', ownerName: 'Ada Lovelace' }
        ];

        expect(readTransferOwners(rows)).toEqual([
            { id: 'u1', name: 'Ada Lovelace' },
            { id: 'u2', name: null }
        ]);
    });

    it('answers no owner for rows nobody owns or without owner fields', () => {
        const unowned: PageOwnedItem = { id: 1, ownerId: null, ownerName: null };

        expect(readTransferOwners([unowned, { id: 2 }])).toEqual([]);
    });
});
