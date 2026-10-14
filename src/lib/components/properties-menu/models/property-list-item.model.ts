import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BadgeConfig } from '../../badge/models/badge.model';
import { PropertySummaryRow } from './property-summary-row.model';

export class PropertyListItem {
    actions: PropertyListItemAction[];
    badges: BadgeConfig[];
    id: string;
    isDisabled: boolean;
    isExpanded: boolean;
    isHidden: boolean;
    isRemovable: boolean;
    label: string;
    metadata: Record<string, unknown>;

    body?: PropertySummaryRow[];
    copyValue?: string;
    description?: string;
    icon?: IconDefinition;
    iconClasses?: string;
    labelParameters?: Record<string, unknown>;

    constructor({
        actions = [],
        badges = [],
        body,
        copyValue,
        description,
        icon,
        iconClasses,
        id,
        isDisabled = false,
        isExpanded = false,
        isHidden = false,
        isRemovable = false,
        label = `${id}.label`,
        labelParameters,
        metadata = {}
    }: PropertyListItemParameters) {
        this.actions = actions;
        this.badges = badges;
        this.body = body;
        this.copyValue = copyValue;
        this.description = description;
        this.icon = icon;
        this.iconClasses = iconClasses;
        this.id = id;
        this.isDisabled = isDisabled;
        this.isExpanded = isExpanded;
        this.isHidden = isHidden;
        this.isRemovable = isRemovable;
        this.label = label;
        this.labelParameters = labelParameters;
        this.metadata = metadata;
    }

    get isExpandable(): boolean {
        return this.body !== undefined;
    }
}

export class PropertyListItemAction {
    icon: IconDefinition;
    key: string;

    label?: string;

    constructor({ icon, key, label }: PropertyListItemActionParameters) {
        this.icon = icon;
        this.key = key;
        this.label = label;
    }
}

export interface PropertyListItemActionParameters {
    icon: IconDefinition;
    key: string;

    label?: string;
}

export interface PropertyListItemParameters {
    id: string;

    actions?: PropertyListItemAction[];
    badges?: BadgeConfig[];
    body?: PropertySummaryRow[];
    copyValue?: string;
    description?: string;
    icon?: IconDefinition;
    iconClasses?: string;
    isDisabled?: boolean;
    isExpanded?: boolean;
    isHidden?: boolean;
    isRemovable?: boolean;
    label?: string;
    labelParameters?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
