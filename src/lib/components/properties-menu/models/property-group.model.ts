import { PropertyFieldsContent, PropertyGroupContent } from './property-group-content.model';

export enum PropertyGroupVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary'
}

export interface PropertyGroupParameters {
    id: string;

    content?: PropertyGroupContent;
    disabled?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    label?: string;
    order?: number;
    removable?: boolean;
    showHeader?: boolean;
    variant?: PropertyGroupVariant;
}

export class PropertyGroup {
    content: PropertyGroupContent;
    disabled: boolean;
    expanded: boolean;
    hidden: boolean;
    id: string;
    label: string;
    order: number;
    removable: boolean;
    showHeader: boolean;
    variant: PropertyGroupVariant;

    constructor({
        content = new PropertyFieldsContent({}),
        disabled = false,
        expanded = false,
        hidden = false,
        id,
        label = `${id}.label`,
        order = 0,
        removable = false,
        showHeader = true,
        variant = PropertyGroupVariant.PRIMARY
    }: PropertyGroupParameters) {
        this.content = content;
        this.disabled = disabled;
        this.expanded = showHeader ? expanded : true;
        this.hidden = hidden;
        this.id = id;
        this.label = label;
        this.order = order;
        this.removable = removable;
        this.showHeader = showHeader;
        this.variant = variant;
    }
}
