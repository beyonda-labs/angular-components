export interface AccountPasswordFormValue {
    password: AccountPasswordUpdate;
}

export interface AccountPasswordUpdate {
    currentPassword: string;
    password: string;
    password2: string;
}

export interface AccountProfile {
    email: string;
    hasPassword: boolean;
    id: string;
    roles: string[];

    language?: string;
    name?: string;
    surname?: string;
    theme?: string;
}

export interface AccountProfileFormValue {
    profile: AccountProfileUpdate;
}

export interface AccountProfileUpdate {
    name: string;
    surname: string;
}

export interface AccountSession {
    accessToken: string;
}

export interface AccountTexts {
    noPassword: string;
    passwordTitle: string;
    profileTitle: string;
    title: string;
}

export class AccountConfig {
    baseUrl: string;
    prefix: string;

    constructor({ baseUrl = '/account', prefix = 'angular-components.account' }: AccountConfigParameters = {}) {
        this.baseUrl = baseUrl;
        this.prefix = prefix;
    }
}

export interface AccountConfigParameters {
    baseUrl?: string;
    prefix?: string;
}

export const ACCOUNT_PASSWORD_SECTION = 'password';
export const ACCOUNT_PROFILE_SECTION = 'profile';
