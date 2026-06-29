import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class BreadcrumbConfig {
    items: BreadcrumbItem[];
    itemMaxWidth: string;
    prefix: string;
    separator: string;
    translate: boolean;

    onItemClick?: (id: number) => void;

    constructor({
        items,
        itemMaxWidth = '12rem',
        prefix = '',
        separator = '/',
        translate = true,
        onItemClick
    }: BreadcrumbConfigParameters) {
        this.items = items;
        this.itemMaxWidth = itemMaxWidth;
        this.onItemClick = onItemClick;
        this.prefix = prefix;
        this.separator = separator;
        this.translate = translate;
    }
}

export interface BreadcrumbConfigParameters {
    items: BreadcrumbItem[];

    itemMaxWidth?: string;
    onItemClick?: (id: number) => void;
    prefix?: string;
    separator?: string;
    translate?: boolean;
}

export class BreadcrumbItem {
    id: number;
    isDisabled: boolean;
    label: string;

    icon?: IconDefinition;

    constructor({ id, icon, isDisabled = false, label }: BreadcrumbItemParameters) {
        this.id = id;
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.label = label;
    }
}

export interface BreadcrumbItemParameters {
    id: number;
    label: string;

    icon?: IconDefinition;
    isDisabled?: boolean;
}
