import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { BadgeConfig } from '../../badge/models/badge.model';
import { PropertyField } from './property-field.model';

/** One line of an expandable list card: a label and a field, a badge or a plain value. */
export class PropertySummaryRow {
    label: string;

    badge?: BadgeConfig;
    field?: PropertyField;
    icon?: IconDefinition;
    value?: string;

    constructor({ badge, field, icon, label, value }: PropertySummaryRowParameters) {
        this.badge = badge;
        this.field = field;
        this.icon = icon;
        this.label = label;
        this.value = value;
    }

    get isEditable(): boolean {
        return this.field !== undefined;
    }
}

export interface PropertySummaryRowParameters {
    label: string;

    badge?: BadgeConfig;
    field?: PropertyField;
    icon?: IconDefinition;
    value?: string;
}
