export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_LENGTH = 8;

export class PasswordPolicy {
    isDigitRequired: boolean;
    isLowercaseRequired: boolean;
    isSymbolRequired: boolean;
    isUppercaseRequired: boolean;
    maxLength: number;
    minLength: number;

    constructor({
        isDigitRequired = false,
        isLowercaseRequired = false,
        isSymbolRequired = false,
        isUppercaseRequired = false,
        maxLength = PASSWORD_MAX_LENGTH,
        minLength = PASSWORD_MIN_LENGTH
    }: PasswordPolicyParameters = {}) {
        this.isDigitRequired = isDigitRequired;
        this.isLowercaseRequired = isLowercaseRequired;
        this.isSymbolRequired = isSymbolRequired;
        this.isUppercaseRequired = isUppercaseRequired;
        this.maxLength = maxLength;
        this.minLength = minLength;
    }
}

export interface PasswordPolicyParameters {
    isDigitRequired?: boolean;
    isLowercaseRequired?: boolean;
    isSymbolRequired?: boolean;
    isUppercaseRequired?: boolean;
    maxLength?: number;
    minLength?: number;
}
