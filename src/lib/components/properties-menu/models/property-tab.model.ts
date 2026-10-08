import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyGroup } from './property-group.model';

export class PropertyTab {
    disabled: boolean;
    groups: PropertyGroup[];
    hidden: boolean;
    id: string;
    label: string;

    addLabel?: string;
    icon?: IconDefinition;
    labelParameters?: Record<string, unknown>;

    constructor({
        addLabel,
        disabled = false,
        groups = [],
        hidden = false,
        icon,
        id,
        label = `${id}.label`,
        labelParameters
    }: PropertyTabParameters) {
        this.addLabel = addLabel;
        this.disabled = disabled;
        this.groups = groups.sort((first, second) => first.order - second.order);
        this.hidden = hidden;
        this.icon = icon;
        this.id = id;
        this.label = label;
        this.labelParameters = labelParameters;
    }
}

export interface PropertyTabParameters {
    id: string;

    addLabel?: string;
    disabled?: boolean;
    groups?: PropertyGroup[];
    hidden?: boolean;
    icon?: IconDefinition;
    label?: string;
    labelParameters?: Record<string, unknown>;
}
