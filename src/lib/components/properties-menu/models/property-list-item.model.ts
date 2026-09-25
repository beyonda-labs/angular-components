import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BadgeConfig } from '../../badge/models/badge.model';
import { PropertySummaryRow } from './property-summary-row.model';

export interface PropertyListItemActionParameters {
    icon: IconDefinition;
    key: string;

    label?: string;
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

export interface PropertyListItemParameters {
    id: string;

    actions?: PropertyListItemActionParameters[];
    badges?: BadgeConfig[];
    body?: PropertySummaryRow[];
    copyValue?: string;
    description?: string;
    disabled?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    icon?: IconDefinition;
    iconClasses?: string;
    label?: string;
    labelParameters?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    removable?: boolean;
}

export class PropertyListItem {
    actions: PropertyListItemAction[];
    badges: BadgeConfig[];
    disabled: boolean;
    expanded: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;
    removable: boolean;

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
        disabled = false,
        expanded = false,
        hidden = false,
        icon,
        iconClasses,
        id,
        label = `${id}.label`,
        labelParameters,
        metadata = {},
        removable = false
    }: PropertyListItemParameters) {
        this.actions = actions.map(action =>
            action instanceof PropertyListItemAction ? action : new PropertyListItemAction(action)
        );
        this.badges = badges;
        this.body = body;
        this.copyValue = copyValue;
        this.description = description;
        this.disabled = disabled;
        this.expanded = expanded;
        this.hidden = hidden;
        this.icon = icon;
        this.iconClasses = iconClasses;
        this.id = id;
        this.label = label;
        this.labelParameters = labelParameters;
        this.metadata = metadata;
        this.removable = removable;
    }

    get isExpandable(): boolean {
        return this.body !== undefined;
    }
}
