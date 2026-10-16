import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyGroup } from './property-group.model';

export class PropertyTab {
    groups: PropertyGroup[];
    id: string;
    isDisabled: boolean;
    isHidden: boolean;
    label: string;

    addLabel?: string;
    icon?: IconDefinition;
    labelParameters?: Record<string, unknown>;

    constructor({
        addLabel,
        groups = [],
        icon,
        id,
        isDisabled = false,
        isHidden = false,
        label = `${id}.label`,
        labelParameters
    }: PropertyTabParameters) {
        this.addLabel = addLabel;
        this.groups = groups.sort((first, second) => first.order - second.order);
        this.icon = icon;
        this.id = id;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.label = label;
        this.labelParameters = labelParameters;
    }
}

export interface PropertyTabParameters {
    id: string;

    addLabel?: string;
    groups?: PropertyGroup[];
    icon?: IconDefinition;
    isDisabled?: boolean;
    isHidden?: boolean;
    label?: string;
    labelParameters?: Record<string, unknown>;
}
