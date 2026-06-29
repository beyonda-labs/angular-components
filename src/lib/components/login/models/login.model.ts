import { FooterConfig } from '../../footer/models/footer.model';

export { FooterConfig };

export type LoginProvider = 'google' | 'microsoft' | 'facebook';

export type RegisterFieldType = 'date' | 'email' | 'number' | 'password' | 'tel' | 'text';

export interface RegisterField {
    name: string;
    type: RegisterFieldType;
    required?: boolean;
    step?: number;
}

export interface LoginProviderConfig {
    id: LoginProvider;
    authUrl: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export class LoginConfig {
    footerConfig: FooterConfig;
    iconSrc: string;
    orgName: string;
    productDescription: string;
    productName: string;
    translatePrefix: string;

    privacyUrl?: string;
    termsUrl?: string;

    constructor({
        iconSrc,
        orgName = 'Beyonda Labs',
        privacyUrl,
        productDescription,
        productName,
        termsUrl,
        translatePrefix = 'angular-components.login'
    }: LoginConfigParameters) {
        this.iconSrc = iconSrc;
        this.orgName = orgName;
        this.privacyUrl = privacyUrl;
        this.productDescription = productDescription;
        this.productName = productName;
        this.termsUrl = termsUrl;
        this.translatePrefix = translatePrefix;
        this.footerConfig = new FooterConfig({
            iconSrc,
            orgName,
            privacyUrl,
            productName,
            termsUrl
        });
    }
}

export interface LoginConfigParameters {
    iconSrc: string;
    productDescription: string;
    productName: string;

    orgName?: string;
    privacyUrl?: string;
    termsUrl?: string;
    translatePrefix?: string;
}
