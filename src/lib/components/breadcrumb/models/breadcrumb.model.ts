import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class BreadcrumbConfig {
    itemMaxWidth: string;
    items: BreadcrumbItem[];
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

export class BreadcrumbItem {
    id: number;
    isDisabled: boolean;
    isTranslationKey: boolean;
    label: string;

    detail?: string;
    detailParameters?: Record<string, unknown>;
    icon?: IconDefinition;

    constructor({
        detail,
        detailParameters,
        id,
        icon,
        isDisabled = false,
        isTranslationKey = false,
        label
    }: BreadcrumbItemParameters) {
        this.detail = detail;
        this.detailParameters = detailParameters;
        this.id = id;
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.isTranslationKey = isTranslationKey;
        this.label = label;
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

export interface BreadcrumbItemParameters {
    id: number;
    label: string;

    detail?: string;
    detailParameters?: Record<string, unknown>;
    icon?: IconDefinition;
    isDisabled?: boolean;
    isTranslationKey?: boolean;
}
