import {
    PageInheritedShare,
    PageShare,
    PageShareAccess,
    PageShareGranteeType,
    PageShares,
    PageShareTargets
} from '../models/page-sharing.model';
import { buildShareChoices, readShareEntries, toShareFormValue } from './page-shares';

const SALES = { id: 'g1', name: 'Sales' };
const GRACE = { email: 'grace@test.com', id: 'u2', name: 'Grace Hopper' };
const LINUS = { email: 'linus@test.com', id: 'u3', name: 'Linus Torvalds' };
const TARGETS: PageShareTargets = { groups: [SALES], users: [GRACE, LINUS] };

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

function buildShares(shares: PageShare[] = [], inherited: PageInheritedShare[] = []): PageShares {
    return { inherited, shares };
}

describe('page shares', () => {
    it('offers every target, groups first, with no access, view and edit, and the own share chosen', () => {
        const choices = buildShareChoices(
            buildShares([share(PageShareGranteeType.User, 'u2', PageShareAccess.Write)]),
            TARGETS
        );

        expect(
            choices.map(({ field, name, options, section, value }) => ({ field, name, options, section, value }))
        ).toEqual([
            { field: 'group-0', name: 'Sales', options: ['read', 'write'], section: 'groups', value: '' },
            { field: 'user-0', name: 'Grace Hopper', options: ['read', 'write'], section: 'users', value: 'write' },
            { field: 'user-1', name: 'Linus Torvalds', options: ['read', 'write'], section: 'users', value: '' }
        ]);
        expect(choices[1].email).toBe('grace@test.com');
    });

    it('offers a target only the access above the strongest one it inherits, from the folder that grants it', () => {
        const choices = buildShareChoices(
            buildShares(
                [],
                [
                    inheritedShare(PageShareGranteeType.Group, 'g1', PageShareAccess.Read, 'Home'),
                    inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Read, 'Home'),
                    inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Write, 'Clients')
                ]
            ),
            TARGETS
        );

        expect(choices.map(({ inherited, options }) => ({ folder: inherited?.folderName, options }))).toEqual([
            { folder: 'Home', options: ['write'] },
            { folder: 'Clients', options: [] },
            { folder: undefined, options: ['read', 'write'] }
        ]);
    });

    it('keeps the choice of an own share inside the inherited one, and the higher own share as chosen', () => {
        const choices = buildShareChoices(
            buildShares(
                [
                    share(PageShareGranteeType.Group, 'g1', PageShareAccess.Read),
                    share(PageShareGranteeType.User, 'u2', PageShareAccess.Write)
                ],
                [
                    inheritedShare(PageShareGranteeType.Group, 'g1', PageShareAccess.Read, 'Home'),
                    inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Read, 'Home')
                ]
            ),
            TARGETS
        );

        expect(choices.map(({ value }) => value)).toEqual(['', 'write', '']);
    });

    it('builds the form value of the choices by section and field', () => {
        const choices = buildShareChoices(
            buildShares([share(PageShareGranteeType.Group, 'g1', PageShareAccess.Read)]),
            TARGETS
        );

        expect(toShareFormValue(choices)).toEqual({
            groups: { 'group-0': 'read' },
            users: { 'user-0': '', 'user-1': '' }
        });
    });

    it('sends the access chosen for each target and nothing for those left without access', () => {
        const choices = buildShareChoices(buildShares(), TARGETS);

        expect(
            readShareEntries(choices, { groups: { 'group-0': 'write' }, users: { 'user-0': '', 'user-1': 'read' } }, [])
        ).toEqual([
            { access: 'write', granteeId: 'g1', granteeType: 'group' },
            { access: 'read', granteeId: 'u3', granteeType: 'user' }
        ]);
    });

    it('keeps an own share the inherited access already covers, and drops a higher one set back to the inherited', () => {
        const shares = [
            share(PageShareGranteeType.Group, 'g1', PageShareAccess.Read),
            share(PageShareGranteeType.User, 'u2', PageShareAccess.Write)
        ];
        const choices = buildShareChoices(
            buildShares(shares, [
                inheritedShare(PageShareGranteeType.Group, 'g1', PageShareAccess.Read, 'Home'),
                inheritedShare(PageShareGranteeType.User, 'u2', PageShareAccess.Read, 'Home')
            ]),
            TARGETS
        );

        expect(readShareEntries(choices, { groups: { 'group-0': '' }, users: { 'user-0': '' } }, shares)).toEqual([
            { access: 'read', granteeId: 'g1', granteeType: 'group' }
        ]);
    });

    it('keeps the shares of grantees the targets do not list, and reads a missing field as its first choice', () => {
        const shares = [
            share(PageShareGranteeType.User, 'u2', PageShareAccess.Read),
            share(PageShareGranteeType.User, 'gone', PageShareAccess.Write)
        ];
        const choices = buildShareChoices(buildShares(shares), TARGETS);

        expect(readShareEntries(choices, {}, shares)).toEqual([
            { access: 'read', granteeId: 'u2', granteeType: 'user' },
            { access: 'write', granteeId: 'gone', granteeType: 'user' }
        ]);
    });
});
