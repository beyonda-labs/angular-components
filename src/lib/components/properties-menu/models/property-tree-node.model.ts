import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface PropertyTreeNodeParameters {
    id: string;

    active?: boolean;
    children?: PropertyTreeNode[];
    disabled?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    icon?: IconDefinition;
    label?: string;
    metadata?: Record<string, unknown>;
}

export class PropertyTreeNode {
    active: boolean;
    children: PropertyTreeNode[];
    disabled: boolean;
    expanded: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;

    icon?: IconDefinition;

    constructor({
        active = false,
        children = [],
        disabled = false,
        expanded = true,
        hidden = false,
        icon,
        id,
        label = `${id}.label`,
        metadata = {}
    }: PropertyTreeNodeParameters) {
        this.active = active;
        this.children = children;
        this.disabled = disabled;
        this.expanded = expanded;
        this.hidden = hidden;
        this.icon = icon;
        this.id = id;
        this.label = label;
        this.metadata = metadata;
    }
}
