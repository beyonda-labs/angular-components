import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyBadge, PropertyBadgeParameters, PropertySummaryRow } from './property-summary-row.model';

export interface PropertyListItemParameters {
    id: string;

    badges?: PropertyBadgeParameters[];
    body?: PropertySummaryRow[];
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
    badges: PropertyBadge[];
    disabled: boolean;
    expanded: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;
    removable: boolean;

    body?: PropertySummaryRow[];
    description?: string;
    icon?: IconDefinition;
    iconClasses?: string;
    labelParameters?: Record<string, unknown>;

    constructor({
        badges = [],
        body,
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
        this.badges = badges.map(badge => (badge instanceof PropertyBadge ? badge : new PropertyBadge(badge)));
        this.body = body;
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
