import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class BreadcrumbConfig {
    isTranslationKey: boolean;
    itemMaxWidth: string;
    items: BreadcrumbItem[];
    prefix: string;
    separator: string;

    onItemClick?: (id: number) => void;

    constructor({
        isTranslationKey = true,
        items,
        itemMaxWidth = '12rem',
        prefix = '',
        separator = '/',
        onItemClick
    }: BreadcrumbConfigParameters) {
        this.isTranslationKey = isTranslationKey;
        this.items = items;
        this.itemMaxWidth = itemMaxWidth;
        this.onItemClick = onItemClick;
        this.prefix = prefix;
        this.separator = separator;
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

export class BreadcrumbText {
    key: string;

    parameters?: Record<string, unknown>;

    constructor({ key, parameters }: BreadcrumbTextParameters) {
        this.key = key;
        this.parameters = parameters;
    }
}

export interface BreadcrumbConfigParameters {
    items: BreadcrumbItem[];

    isTranslationKey?: boolean;
    itemMaxWidth?: string;
    onItemClick?: (id: number) => void;
    prefix?: string;
    separator?: string;
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

export interface BreadcrumbTextParameters {
    key: string;

    parameters?: Record<string, unknown>;
}
