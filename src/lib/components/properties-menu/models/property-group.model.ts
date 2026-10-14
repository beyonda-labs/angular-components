import { PropertyFieldsContent, PropertyGroupContent } from './property-group-content.model';

export enum PropertyGroupVariant {
    PRIMARY = 'primary',
    SECONDARY = 'secondary'
}

export class PropertyGroup {
    content: PropertyGroupContent;
    id: string;
    isDisabled: boolean;
    isExpanded: boolean;
    isHeaderShown: boolean;
    isHidden: boolean;
    isRemovable: boolean;
    label: string;
    order: number;
    variant: PropertyGroupVariant;

    labelParameters?: Record<string, unknown>;

    constructor({
        content = new PropertyFieldsContent({}),
        id,
        isDisabled = false,
        isExpanded = false,
        isHeaderShown = true,
        isHidden = false,
        isRemovable = false,
        label = `${id}.label`,
        labelParameters,
        order = 0,
        variant = PropertyGroupVariant.PRIMARY
    }: PropertyGroupParameters) {
        this.content = content;
        this.id = id;
        this.isDisabled = isDisabled;
        this.isExpanded = isHeaderShown ? isExpanded : true;
        this.isHeaderShown = isHeaderShown;
        this.isHidden = isHidden;
        this.isRemovable = isRemovable;
        this.label = label;
        this.labelParameters = labelParameters;
        this.order = order;
        this.variant = variant;
    }
}

export interface PropertyGroupParameters {
    id: string;

    content?: PropertyGroupContent;
    isDisabled?: boolean;
    isExpanded?: boolean;
    isHeaderShown?: boolean;
    isHidden?: boolean;
    isRemovable?: boolean;
    label?: string;
    labelParameters?: Record<string, unknown>;
    order?: number;
    variant?: PropertyGroupVariant;
}
