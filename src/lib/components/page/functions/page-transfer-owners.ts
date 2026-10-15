import { PageItem } from '../models/page-item.model';
import { PageOwnedItem, PageOwner } from '../models/page-owner.model';

export function readTransferOwners(items: PageItem[]): PageOwner[] {
    const owners = new Map<string, PageOwner>();

    for (const item of items) {
        const { ownerId, ownerName } = item as Partial<PageOwnedItem>;

        if (typeof ownerId === 'string' && !owners.has(ownerId)) {
            owners.set(ownerId, { id: ownerId, name: ownerName ?? null });
        }
    }

    return [...owners.values()];
}
