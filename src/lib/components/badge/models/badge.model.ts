export enum BadgeVariant {
    Danger = 'danger',
    Info = 'info',
    Neutral = 'neutral',
    Outline = 'outline',
    Pink = 'pink',
    Primary = 'primary',
    Purple = 'purple',
    Secondary = 'secondary',
    Strong = 'strong',
    Success = 'success',
    Teal = 'teal',
    Warning = 'warning'
}

export class BadgeConfig {
    isTranslated: boolean;
    label: string;
    variant: BadgeVariant;

    constructor({ isTranslated = true, label, variant = BadgeVariant.Neutral }: BadgeConfigParameters) {
        this.isTranslated = isTranslated;
        this.label = label;
        this.variant = variant;
    }
}

export interface BadgeConfigParameters {
    label: string;

    isTranslated?: boolean;
    variant?: BadgeVariant;
}
