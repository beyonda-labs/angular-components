export class ListConfig<TItem = unknown> {
    gap: string;
    items: TItem[];
    prefix: string;

    bare: boolean;
    emptyLabel?: string;
    getItemKey?: (item: TItem, index: number) => string | number;
    onItemClick?: (item: TItem, index: number) => void;

    constructor({
        bare = false,
        emptyLabel,
        gap = '0.75rem',
        getItemKey,
        items,
        onItemClick,
        prefix
    }: ListConfigParameters<TItem>) {
        this.bare = bare;
        this.emptyLabel = emptyLabel;
        this.gap = gap;
        this.getItemKey = getItemKey;
        this.items = items;
        this.onItemClick = onItemClick;
        this.prefix = prefix;
    }
}

export interface ListConfigParameters<TItem = unknown> {
    items: TItem[];
    prefix: string;

    bare?: boolean;
    emptyLabel?: string;
    gap?: string;
    getItemKey?: (item: TItem, index: number) => string | number;
    onItemClick?: (item: TItem, index: number) => void;
}

export interface ListItemContext<TItem = unknown> {
    $implicit: TItem;
    index: number;
}
