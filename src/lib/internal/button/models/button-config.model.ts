import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class ButtonConfig {
    action: () => void;
    isDisabled: boolean;
    isHidden: boolean;
    label: string;
    tooltip: string;
    type: ButtonType;

    customClass?: string;
    customStyles?: string;
    icon?: IconDefinition;
    tooltipPlacement?: TooltipPlacement;

    constructor({
        action,
        icon,
        label,

        customClass,
        customStyles,
        isDisabled = false,
        isHidden = false,
        tooltip = '',
        tooltipPlacement,
        type = ButtonType.Primary
    }: ButtonParameters) {
        this.action = action;
        this.customClass = customClass;
        this.customStyles = customStyles;
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.label = label ?? '';
        this.tooltip = tooltip;
        this.tooltipPlacement = tooltipPlacement;
        this.type = type;
    }
}

export interface ButtonParameters {
    action: () => void;
    label?: string;

    customClass?: string;
    customStyles?: string;
    icon?: IconDefinition;
    isDisabled?: boolean;
    isHidden?: boolean;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
    type?: ButtonType;
}

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Tertiary = 'tertiary',
    LinkSecondary = 'link-secondary'
}
