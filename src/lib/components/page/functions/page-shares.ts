import {
    PAGE_SHARE_ACCESS_LEVELS,
    PageInheritedShare,
    PageShare,
    PageShareAccess,
    PageShareChoice,
    PageShareEntry,
    PageShareFormValue,
    PageShareGranteeType,
    PageShares,
    PageShareSection,
    PageShareTarget,
    PageShareTargets
} from '../models/page-sharing.model';

export function buildShareChoices(
    { inherited, shares }: PageShares,
    { groups, users }: PageShareTargets
): PageShareChoice[] {
    const strongest = strongestInherited(inherited);
    const own = new Map(shares.map(share => [granteeKey(share.granteeType, share.granteeId), share.access]));
    const toChoices = (targets: PageShareTarget[], granteeType: PageShareGranteeType, section: PageShareSection) =>
        targets.map((target, index) => {
            const key = granteeKey(granteeType, target.id);
            const place = { field: `${granteeType}-${index}`, granteeType, section };

            return buildChoice(target, place, strongest.get(key), own.get(key));
        });

    return [
        ...toChoices(groups, PageShareGranteeType.Group, 'groups'),
        ...toChoices(users, PageShareGranteeType.User, 'users')
    ];
}

export function readShareEntries(
    choices: PageShareChoice[],
    value: PageShareFormValue,
    shares: PageShare[]
): PageShareEntry[] {
    const listed = new Set(choices.map(({ granteeId, granteeType }) => granteeKey(granteeType, granteeId)));
    const chosen = choices.flatMap(choice => {
        const access = readChoice(choice, value);

        return access ? [{ access, granteeId: choice.granteeId, granteeType: choice.granteeType }] : [];
    });
    const unlisted = shares
        .filter(({ granteeId, granteeType }) => !listed.has(granteeKey(granteeType, granteeId)))
        .map(({ access, granteeId, granteeType }) => ({ access, granteeId, granteeType }));

    return [...chosen, ...unlisted];
}

export function toShareFormValue(choices: PageShareChoice[]): PageShareFormValue {
    return choices.reduce<PageShareFormValue>(
        (value, choice) => ({ ...value, [choice.section]: { ...value[choice.section], [choice.field]: choice.value } }),
        {}
    );
}

function buildChoice(
    { email, id, name }: PageShareTarget,
    { field, granteeType, section }: Pick<PageShareChoice, 'field' | 'granteeType' | 'section'>,
    inherited?: PageInheritedShare,
    own?: PageShareAccess
): PageShareChoice {
    const options = PAGE_SHARE_ACCESS_LEVELS.filter(access => !inherited || isAbove(access, inherited.access));

    return {
        email,
        field,
        granteeId: id,
        granteeType,
        inherited,
        name,
        options,
        own,
        section,
        value: own && options.includes(own) ? own : ''
    };
}

function granteeKey(granteeType: PageShareGranteeType, granteeId: string): string {
    return `${granteeType}:${granteeId}`;
}

function isAbove(access: PageShareAccess, other: PageShareAccess): boolean {
    return PAGE_SHARE_ACCESS_LEVELS.indexOf(access) > PAGE_SHARE_ACCESS_LEVELS.indexOf(other);
}

function readChoice(choice: PageShareChoice, value: PageShareFormValue): PageShareAccess | undefined {
    const picked = value[choice.section]?.[choice.field] ?? choice.value;
    const access = PAGE_SHARE_ACCESS_LEVELS.find(level => level === picked);

    if (access) {
        return access;
    }

    return choice.inherited && choice.own && !choice.options.includes(choice.own) ? choice.own : undefined;
}

function strongestInherited(inherited: PageInheritedShare[]): Map<string, PageInheritedShare> {
    const strongest = new Map<string, PageInheritedShare>();

    for (const share of inherited) {
        const key = granteeKey(share.granteeType, share.granteeId);
        const current = strongest.get(key);

        if (!current || isAbove(share.access, current.access)) {
            strongest.set(key, share);
        }
    }

    return strongest;
}
