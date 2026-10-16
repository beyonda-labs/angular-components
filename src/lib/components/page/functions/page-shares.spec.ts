import { PageInheritedShare, PageShare, PageShareAccess, PageShareGranteeType } from '../models/page-sharing.model';
import { coveredGrantees, readShareEntries, shareGranteeValue, toShareFormValue } from './page-shares';

function share(granteeType: PageShareGranteeType, granteeId: string, access: PageShareAccess): PageShare {
    return { access, granteeId, granteeName: granteeId, granteeType, id: `${granteeType}-${granteeId}` };
}

function inheritedShare(
    granteeType: PageShareGranteeType,
    granteeId: string,
    access: PageShareAccess,
    folderName: string
): PageInheritedShare {
    return { ...share(granteeType, granteeId, access), folderId: folderName.toLowerCase(), folderName };
}

describe('page shares', () => {
    it('names a grantee by its type and its id', () => {
        expect(shareGranteeValue({ granteeId: 'g1', granteeType: PageShareGranteeType.Group })).toBe('group:g1');
    });

    it('puts each own share in the list of its access', () => {
        expect(
            toShareFormValue([
                share(PageShareGranteeType.Group, 'g1', PageShareAccess.Read),
                share(PageShareGranteeType.User, 'u2', PageShareAccess.Write),
                share(PageShareGranteeType.User, 'u3', PageShareAccess.Read)
            ])
        ).toEqual({ grantees: { read: ['group:g1', 'user:u3'], write: ['user:u2'] } });
    });

    it('opens both lists empty for a folder without own shares', () => {
        expect(toShareFormValue([])).toEqual({ grantees: { read: [], write: [] } });
    });

    it('sends read for every row of the view list and write for every row of the edit list', () => {
        expect(readShareEntries({ grantees: { read: ['group:g1', 'user:u3'], write: ['user:u2'] } })).toEqual([
            { access: 'read', granteeId: 'g1', granteeType: 'group' },
            { access: 'read', granteeId: 'u3', granteeType: 'user' },
            { access: 'write', granteeId: 'u2', granteeType: 'user' }
        ]);
    });

    it('sends nothing for empty or missing lists, nor for a value that names no grantee', () => {
        expect(readShareEntries({})).toEqual([]);
        expect(readShareEntries({ grantees: { read: ['team:t1', 'u2', 'user:'] } })).toEqual([]);
    });

    it('names the grantees an inherited share already gives an access, once each', () => {
        const inherited = [
            inheritedShare(PageShareGranteeType.Group, 'g1', PageShareAccess.Read, 'Home'),
            inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Read, 'Home'),
            inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Write, 'Clients')
        ];

        expect(coveredGrantees(inherited, PageShareAccess.Read)).toEqual(['group:g1', 'user:u2']);
        expect(coveredGrantees(inherited, PageShareAccess.Write)).toEqual(['user:u2']);
    });
});
