import { IconDefinition } from '@fortawesome/angular-fontawesome';

export enum ButtonType {
    IconOutline = 'icon-outline',
    LinkSecondary = 'link-secondary',
    Primary = 'primary',
    Secondary = 'secondary',
    Tertiary = 'tertiary'
}

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export class ButtonConfig {
    action: () => void;
    isDisabled: boolean;
    isHidden: boolean;
    label: string;
    tooltip: string;
    type: ButtonType;

    ariaLabel?: string;
    customClass?: string;
    customStyles?: string;
    icon?: IconDefinition;
    tooltipPlacement?: TooltipPlacement;

    constructor({
        action,
        ariaLabel,
        customClass,
        customStyles,
        icon,
        isDisabled = false,
        isHidden = false,
        label = '',
        tooltip = '',
        tooltipPlacement,
        type = ButtonType.Primary
    }: ButtonParameters) {
        this.action = action;
        this.ariaLabel = ariaLabel;
        this.customClass = customClass;
        this.customStyles = customStyles;
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.label = label;
        this.tooltip = tooltip;
        this.tooltipPlacement = tooltipPlacement;
        this.type = type;
    }
}

export interface ButtonParameters {
    action: () => void;

    ariaLabel?: string;
    customClass?: string;
    customStyles?: string;
    icon?: IconDefinition;
    isDisabled?: boolean;
    isHidden?: boolean;
    label?: string;
    tooltip?: string;
    tooltipPlacement?: TooltipPlacement;
    type?: ButtonType;
}
