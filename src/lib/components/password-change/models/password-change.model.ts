import { AccountPasswordUpdate } from '../../../services/account/models/account.model';

export interface PasswordChangeFormValue {
    password: AccountPasswordUpdate;
}

export interface PasswordChangeTexts {
    description: string;
    noPassword: string;
    title: string;
}

export class PasswordChangeConfig {
    baseUrl: string;
    prefix: string;

    constructor({
        baseUrl = '/account',
        prefix = 'angular-components.password-change'
    }: PasswordChangeConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.prefix = prefix;
    }
}

export interface PasswordChangeConfigParameters {
    baseUrl?: string;
    prefix?: string;
}

export const PASSWORD_CHANGE_SECTION = 'password';
