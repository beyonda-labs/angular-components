import { FooterConfig } from '../../footer/models/footer.model';

export { FooterConfig };

export type LoginProvider = 'google' | 'microsoft' | 'facebook';

export type RegisterFieldType = 'date' | 'email' | 'number' | 'password' | 'tel' | 'text';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginProviderConfig {
    authUrl: string;
    id: LoginProvider;
}

export interface LoginResponse {
    accessToken: string;
}

export interface RegisterField {
    name: string;
    type: RegisterFieldType;

    required?: boolean;
    step?: number;
}

export class LoginConfig {
    footerConfig: FooterConfig;
    iconSrc: string;
    orgName: string;
    prefix: string;
    productDescription: string;
    productName: string;

    privacyUrl?: string;
    termsUrl?: string;

    constructor({
        iconSrc,
        orgName = 'Beyonda Labs',
        privacyUrl,
        productDescription,
        productName,
        termsUrl,
        prefix = 'angular-components.login'
    }: LoginConfigParameters) {
        this.iconSrc = iconSrc;
        this.orgName = orgName;
        this.privacyUrl = privacyUrl;
        this.productDescription = productDescription;
        this.productName = productName;
        this.termsUrl = termsUrl;
        this.prefix = prefix;
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
    prefix?: string;
    privacyUrl?: string;
    termsUrl?: string;
}
