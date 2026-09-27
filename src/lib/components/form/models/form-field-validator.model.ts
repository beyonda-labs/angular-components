import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';

export enum FormFieldValidatorType {
    Custom,
    Email,
    MaxLength,
    MinLength,
    Pattern,
    Url
}

export class FormFieldAsyncValidator {
    asyncValidatorFn: AsyncValidatorFn;

    constructor(asyncValidatorFunction: AsyncValidatorFn) {
        this.asyncValidatorFn = asyncValidatorFunction;
    }
}

export abstract class FormFieldValidator {
    type: FormFieldValidatorType;

    args?: number | RegExp | ValidatorFn;

    constructor({ args, type }: FormFieldValidatorParameters) {
        this.args = args;
        this.type = type;
    }
}

export class FormFieldCustomValidator extends FormFieldValidator {
    validatorFn: ValidatorFn;

    constructor(validatorFunction: ValidatorFn) {
        super({ type: FormFieldValidatorType.Custom, args: validatorFunction });
        this.validatorFn = validatorFunction;
    }
}

export class FormFieldEmailValidator extends FormFieldValidator {
    constructor() {
        super({ type: FormFieldValidatorType.Email });
    }
}

export class FormFieldLengthValidator extends FormFieldValidator {
    constructor(length: number, type: FormFieldValidatorType.MaxLength | FormFieldValidatorType.MinLength) {
        super({ args: length, type });
    }
}

export class FormFieldPatternValidator extends FormFieldValidator {
    constructor(pattern: RegExp) {
        super({ args: pattern, type: FormFieldValidatorType.Pattern });
    }
}

export class FormFieldUrlValidator extends FormFieldValidator {
    constructor() {
        super({ type: FormFieldValidatorType.Url });
    }
}

interface FormFieldValidatorParameters {
    type: FormFieldValidatorType;

    args?: number | RegExp | ValidatorFn;
}
