import {
    PAGE_SHARE_ACCESS_LEVELS,
    PageInheritedShare,
    PageShare,
    PageShareAccess,
    PageShareEntry,
    PageShareFormValue,
    PageShareGranteeType
} from '../models/page-sharing.model';

const GRANTEE_SEPARATOR = ':';
const GRANTEE_TYPES: readonly string[] = Object.values(PageShareGranteeType);

export function coveredGrantees(inherited: PageInheritedShare[], access: PageShareAccess): string[] {
    return [
        ...new Set(inherited.filter(share => reaches(share.access, access)).map(share => shareGranteeValue(share)))
    ];
}

export function readShareEntries(value: PageShareFormValue): PageShareEntry[] {
    return PAGE_SHARE_ACCESS_LEVELS.flatMap(access =>
        (value.grantees?.[access] ?? []).flatMap(granteeValue => {
            const grantee = parseGranteeValue(granteeValue);

            return grantee ? [{ access, ...grantee }] : [];
        })
    );
}

export function shareGranteeValue({ granteeId, granteeType }: Pick<PageShare, 'granteeId' | 'granteeType'>): string {
    return `${granteeType}${GRANTEE_SEPARATOR}${granteeId}`;
}

export function toShareFormValue(shares: PageShare[]): PageShareFormValue {
    return {
        grantees: Object.fromEntries(
            PAGE_SHARE_ACCESS_LEVELS.map(access => [
                access,
                shares.filter(share => share.access === access).map(share => shareGranteeValue(share))
            ])
        )
    };
}

function parseGranteeValue(value: string): Pick<PageShareEntry, 'granteeId' | 'granteeType'> | undefined {
    const index = value.indexOf(GRANTEE_SEPARATOR);
    const granteeType = value.slice(0, index);
    const granteeId = value.slice(index + 1);

    return index > 0 && granteeId && GRANTEE_TYPES.includes(granteeType)
        ? { granteeId, granteeType: granteeType as PageShareGranteeType }
        : undefined;
}

function reaches(access: PageShareAccess, other: PageShareAccess): boolean {
    return PAGE_SHARE_ACCESS_LEVELS.indexOf(access) >= PAGE_SHARE_ACCESS_LEVELS.indexOf(other);
}
