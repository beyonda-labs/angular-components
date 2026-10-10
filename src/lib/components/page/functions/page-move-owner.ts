import { PageItem } from '../models/page-item.model';
import { PageOwnedItem } from '../models/page-owner.model';

export function hasOneOwner(items: PageItem[]): boolean {
    return items.length === 0 || isSameOwner(items[0], items);
}

export function isSameOwner(target: PageItem, items: PageItem[]): boolean {
    const ownerId = readOwnerId(target);

    return items.every(item => readOwnerId(item) === ownerId);
}

export function readMoveOwnerId(items: PageItem[]): string | undefined {
    const ownerId = items.length > 0 && hasOneOwner(items) ? readOwnerId(items[0]) : undefined;

    return typeof ownerId === 'string' ? ownerId : undefined;
}

function readOwnerId(item: PageItem): PageOwnedItem['ownerId'] | undefined {
    return (item as Partial<PageOwnedItem>).ownerId;
}
