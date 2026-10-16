import { IconDefinition } from '@fortawesome/angular-fontawesome';

export type PropertyTreeDropPosition = 'after' | 'before' | 'inside';

export class PropertyTreeNode {
    canAcceptDrop: boolean;
    children: PropertyTreeNode[];
    id: string;
    isActive: boolean;
    isDisabled: boolean;
    isDraggable: boolean;
    isDropDisabled: boolean;
    isExpanded: boolean;
    isHidden: boolean;
    label: string;
    metadata: Record<string, unknown>;

    icon?: IconDefinition;
    labelParameters?: Record<string, unknown>;

    constructor({
        canAcceptDrop = false,
        children = [],
        icon,
        id,
        isActive = false,
        isDisabled = false,
        isDraggable = false,
        isDropDisabled = false,
        isExpanded = true,
        isHidden = false,
        label = `${id}.label`,
        labelParameters,
        metadata = {}
    }: PropertyTreeNodeParameters) {
        this.canAcceptDrop = canAcceptDrop;
        this.children = children;
        this.icon = icon;
        this.id = id;
        this.isActive = isActive;
        this.isDisabled = isDisabled;
        this.isDraggable = isDraggable;
        this.isDropDisabled = isDropDisabled;
        this.isExpanded = isExpanded;
        this.isHidden = isHidden;
        this.label = label;
        this.labelParameters = labelParameters;
        this.metadata = metadata;
    }
}

export interface PropertyTreeNodeParameters {
    id: string;

    canAcceptDrop?: boolean;
    children?: PropertyTreeNode[];
    icon?: IconDefinition;
    isActive?: boolean;
    isDisabled?: boolean;
    isDraggable?: boolean;
    isDropDisabled?: boolean;
    isExpanded?: boolean;
    isHidden?: boolean;
    label?: string;
    labelParameters?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
