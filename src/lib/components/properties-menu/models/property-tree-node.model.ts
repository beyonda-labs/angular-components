import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface PropertyTreeNodeParameters {
    id: string;

    acceptsDrop?: boolean;
    active?: boolean;
    children?: PropertyTreeNode[];
    disabled?: boolean;
    draggable?: boolean;
    dropDisabled?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    icon?: IconDefinition;
    label?: string;
    metadata?: Record<string, unknown>;
}

export class PropertyTreeNode {
    acceptsDrop: boolean;
    active: boolean;
    children: PropertyTreeNode[];
    disabled: boolean;
    draggable: boolean;
    dropDisabled: boolean;
    expanded: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;

    icon?: IconDefinition;

    constructor({
        acceptsDrop = false,
        active = false,
        children = [],
        disabled = false,
        draggable = false,
        dropDisabled = false,
        expanded = true,
        hidden = false,
        icon,
        id,
        label = `${id}.label`,
        metadata = {}
    }: PropertyTreeNodeParameters) {
        this.acceptsDrop = acceptsDrop;
        this.active = active;
        this.children = children;
        this.disabled = disabled;
        this.draggable = draggable;
        this.dropDisabled = dropDisabled;
        this.expanded = expanded;
        this.hidden = hidden;
        this.icon = icon;
        this.id = id;
        this.label = label;
        this.metadata = metadata;
    }
}
