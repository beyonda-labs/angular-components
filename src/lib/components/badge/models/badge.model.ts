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
    label: string;
    translate: boolean;
    variant: BadgeVariant;

    constructor({ label, translate = true, variant = BadgeVariant.Neutral }: BadgeConfigParameters) {
        this.label = label;
        this.translate = translate;
        this.variant = variant;
    }
}

export interface BadgeConfigParameters {
    label: string;

    /** Run the label through the translate pipe; on by default. */
    translate?: boolean;
    variant?: BadgeVariant;
}
