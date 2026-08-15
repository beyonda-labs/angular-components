import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyField } from './property-field.model';

export interface PropertyBadgeParameters {
    label: string;

    cssClass?: string;
}

export class PropertyBadge {
    cssClass: string;
    label: string;

    constructor({ cssClass = 'bey-badge-color-neutral', label }: PropertyBadgeParameters) {
        this.cssClass = cssClass;
        this.label = label;
    }
}

export interface PropertySummaryRowParameters {
    label: string;

    badge?: PropertyBadgeParameters;
    field?: PropertyField;
    icon?: IconDefinition;
    value?: string;
}

export class PropertySummaryRow {
    label: string;

    badge?: PropertyBadge;
    field?: PropertyField;
    icon?: IconDefinition;
    value?: string;

    constructor({ badge, field, icon, label, value }: PropertySummaryRowParameters) {
        this.badge = badge && (badge instanceof PropertyBadge ? badge : new PropertyBadge(badge));
        this.field = field;
        this.icon = icon;
        this.label = label;
        this.value = value;
    }

    get isEditable(): boolean {
        return this.field !== undefined;
    }
}
