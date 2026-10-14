import {
    BeyPageInheritedShare,
    BeyPageItemType,
    BeyPageOwnedItem,
    BeyPageShare,
    BeyPageShareAccess,
    BeyPageShareGranteeType,
    BeyPageShareTarget
} from '@beyonda-labs/angular-components';

export interface StyleGuideDocument extends BeyPageOwnedItem {
    name: string;
    parentId: string | null;
    type: BeyPageItemType;

    isShared?: boolean;
}

export interface StyleGuideShares {
    inherited: BeyPageInheritedShare[];
    shares: BeyPageShare[];
}

export const STYLE_GUIDE_DOCUMENTS_URL = '/style-guide/documents';

export const STYLE_GUIDE_DOCUMENTS: readonly StyleGuideDocument[] = [
    {
        actions: ['share'],
        id: 'contracts',
        isShared: true,
        name: 'Contracts',
        ownerId: 'u1',
        ownerName: 'Ada Lovelace',
        parentId: null,
        type: BeyPageItemType.Category
    },
    {
        actions: ['share'],
        id: 'drafts',
        name: 'Drafts',
        ownerId: 'u1',
        ownerName: 'Ada Lovelace',
        parentId: null,
        type: BeyPageItemType.Category
    },
    {
        actions: ['view'],
        id: 'offer',
        name: 'Offer 2026',
        ownerId: 'u1',
        ownerName: 'Ada Lovelace',
        parentId: null,
        type: BeyPageItemType.Item
    },
    {
        actions: ['view'],
        id: 'nda',
        name: 'Non-disclosure agreement',
        ownerId: 'u1',
        ownerName: 'Ada Lovelace',
        parentId: 'contracts',
        type: BeyPageItemType.Item
    },
    {
        actions: [],
        id: 'clients',
        name: 'Clients',
        ownerId: 'u2',
        ownerName: 'Grace Hopper',
        parentId: null,
        type: BeyPageItemType.Category
    },
    {
        actions: [],
        id: 'acme',
        name: 'Acme',
        ownerId: 'u2',
        ownerName: 'Grace Hopper',
        parentId: 'clients',
        type: BeyPageItemType.Category
    },
    {
        actions: ['view'],
        id: 'terms',
        name: 'Terms of service',
        ownerId: 'u2',
        ownerName: 'Grace Hopper',
        parentId: 'clients',
        type: BeyPageItemType.Item
    },
    {
        actions: ['view'],
        id: 'invoice',
        name: 'Invoice 7',
        ownerId: 'u2',
        ownerName: 'Grace Hopper',
        parentId: 'acme',
        type: BeyPageItemType.Item
    }
];

export const STYLE_GUIDE_DOCUMENT_OWNER_ID = 'u1';

export const STYLE_GUIDE_DOCUMENT_SHARES: Readonly<Record<string, StyleGuideShares>> = {
    contracts: {
        inherited: [],
        shares: [
            {
                access: BeyPageShareAccess.Read,
                granteeId: 'g1',
                granteeName: 'Sales',
                granteeType: BeyPageShareGranteeType.Group,
                id: 's1'
            }
        ]
    }
};

export const STYLE_GUIDE_SHARE_GROUPS: readonly BeyPageShareTarget[] = [{ id: 'g1', memberCount: 3, name: 'Sales' }];

export const STYLE_GUIDE_SHARE_USERS: readonly BeyPageShareTarget[] = [
    { email: 'grace@example.test', id: 'u2', name: 'Grace Hopper' },
    { email: 'alan@example.test', id: 'u3', name: 'Alan Turing' }
];

export const STYLE_GUIDE_SHARED_FOLDER_IDS: readonly string[] = ['clients'];
