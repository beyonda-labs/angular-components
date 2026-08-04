import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface PropertyListItemParameters {
    id: string;

    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    icon?: IconDefinition;
    label?: string;
    metadata?: Record<string, unknown>;
}

export class PropertyListItem {
    disabled: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;

    description?: string;
    icon?: IconDefinition;

    constructor({
        description,
        disabled = false,
        hidden = false,
        icon,
        id,
        label = `${id}.label`,
        metadata = {}
    }: PropertyListItemParameters) {
        this.description = description;
        this.disabled = disabled;
        this.hidden = hidden;
        this.icon = icon;
        this.id = id;
        this.label = label;
        this.metadata = metadata;
    }
}
