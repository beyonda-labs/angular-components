export enum AvatarVariant {
    Soft = 'soft',
    Solid = 'solid'
}

export class AvatarConfig {
    name: string;
    variant: AvatarVariant;

    initials?: string;
    surname?: string;

    constructor({ initials, name, surname, variant = AvatarVariant.Solid }: AvatarConfigParameters) {
        this.initials = initials;
        this.name = name;
        this.surname = surname;
        this.variant = variant;
    }
}

export interface AvatarConfigParameters {
    name: string;

    initials?: string;
    surname?: string;
    variant?: AvatarVariant;
}
