import { PageItem } from '../models/page-item.model';
import { PageOwnedItem } from '../models/page-owner.model';
import { hasOneOwner, isSameOwner, readMoveOwnerId } from './page-move-owner';

const ADA_FOLDER: PageOwnedItem = { id: 'ada-folder', ownerId: 'ada', ownerName: 'Ada Lovelace' };
const ADA_OFFER: PageOwnedItem = { id: 'ada-offer', ownerId: 'ada', ownerName: 'Ada Lovelace' };
const ADA_TERMS: PageOwnedItem = { id: 'ada-terms', ownerId: 'ada', ownerName: 'Ada Lovelace' };
const GRACE_OFFER: PageOwnedItem = { id: 'grace-offer', ownerId: 'grace', ownerName: 'Grace Hopper' };
const COMMON_FOLDER: PageOwnedItem = { id: 'common-folder', ownerId: null, ownerName: null };
const PLAIN_FOLDER: PageItem = { id: 'plain-folder' };
const PLAIN_OFFER: PageItem = { id: 'plain-offer' };

describe('hasOneOwner', () => {
    it('holds for rows of a single owner and for rows without owners', () => {
        expect(hasOneOwner([ADA_OFFER, ADA_TERMS])).toBe(true);
        expect(hasOneOwner([PLAIN_OFFER, PLAIN_FOLDER])).toBe(true);
        expect(hasOneOwner([])).toBe(true);
    });

    it('fails for rows of several owners, a common row among them', () => {
        expect(hasOneOwner([ADA_OFFER, GRACE_OFFER])).toBe(false);
        expect(hasOneOwner([ADA_OFFER, COMMON_FOLDER])).toBe(false);
    });
});

describe('isSameOwner', () => {
    it('holds when every row has the owner of the target, or none of them has owners', () => {
        expect(isSameOwner(ADA_FOLDER, [ADA_OFFER, ADA_TERMS])).toBe(true);
        expect(isSameOwner(PLAIN_FOLDER, [PLAIN_OFFER])).toBe(true);
    });

    it('fails when a row has another owner than the target, a common target included', () => {
        expect(isSameOwner(ADA_FOLDER, [ADA_OFFER, GRACE_OFFER])).toBe(false);
        expect(isSameOwner(COMMON_FOLDER, [ADA_OFFER])).toBe(false);
    });
});

describe('readMoveOwnerId', () => {
    it('answers the owner the moved rows share', () => {
        expect(readMoveOwnerId([ADA_OFFER, ADA_FOLDER])).toBe('ada');
    });

    it('answers no owner for rows without owners, common rows, mixed owners or no rows', () => {
        expect(readMoveOwnerId([PLAIN_OFFER])).toBeUndefined();
        expect(readMoveOwnerId([COMMON_FOLDER])).toBeUndefined();
        expect(readMoveOwnerId([ADA_OFFER, GRACE_OFFER])).toBeUndefined();
        expect(readMoveOwnerId([])).toBeUndefined();
    });
});
