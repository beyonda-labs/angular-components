export interface ListItemContext<TItem = unknown> {
    $implicit: TItem;
    index: number;
}

export class ListConfig<TItem = unknown> {
    gap: string;
    isBare: boolean;
    items: TItem[];
    prefix: string;

    emptyLabel?: string;
    getItemKey?: (item: TItem, index: number) => string | number;
    onItemClick?: (item: TItem, index: number) => void;

    constructor({
        emptyLabel,
        gap = '0.75rem',
        getItemKey,
        isBare = false,
        items,
        onItemClick,
        prefix
    }: ListConfigParameters<TItem>) {
        this.emptyLabel = emptyLabel;
        this.gap = gap;
        this.getItemKey = getItemKey;
        this.isBare = isBare;
        this.items = items;
        this.onItemClick = onItemClick;
        this.prefix = prefix;
    }
}

export interface ListConfigParameters<TItem = unknown> {
    items: TItem[];
    prefix: string;

    emptyLabel?: string;
    gap?: string;
    getItemKey?: (item: TItem, index: number) => string | number;
    isBare?: boolean;
    onItemClick?: (item: TItem, index: number) => void;
}
