import { FooterConfig } from '../../footer/models/footer.model';

export { FooterConfig };

export const LINK_TOKEN_PARAMETER = 'token';
export const LOGIN_VIEW_PARAMETER = 'view';

export type AccountLinkFlow = 'accept-invitation' | 'reset-password' | 'verify-email';

export type EmailVerificationStatus = 'failed' | 'invalid' | 'verified' | 'verifying';

export type InvitationStatus = 'failed' | 'invalid' | 'loading' | 'ready';

export type LinkErrorReason = 'failed' | 'invalid';

export type LoginProvider = 'google' | 'microsoft' | 'facebook';

export type LoginView = 'forgot-password' | 'login' | 'register' | 'registered';

export type RegisterFieldType = 'date' | 'email' | 'number' | 'password' | 'tel' | 'text';

export type RegisterResponse = LoginResponse | VerificationRequiredResponse;

export interface AcceptInvitationFormValue {
    'accept-invitation': NewPasswordFormValue & { name: string | null; surname: string | null };
}

export interface AcceptInvitationRequest extends NewPassword {
    token: string;

    name?: string;
    surname?: string;
}

export interface ForgotPasswordFormValue {
    'forgot-password': { email: string | null };
}

export interface Invitation {
    email: string;

    name?: string;
    surname?: string;
}

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

export interface NewPassword {
    password: string;
    password2: string;
}

export interface NewPasswordFormValue {
    password: string | null;
    password2: string | null;
}

export interface RegisterField {
    name: string;
    type: RegisterFieldType;

    required?: boolean;
    step?: number;
}

export interface ResetPasswordFormValue {
    'reset-password': NewPasswordFormValue;
}

export interface ResetPasswordRequest extends NewPassword {
    token: string;
}

export interface VerificationRequiredResponse {
    verificationRequired: true;
}

export class LoginConfig {
    footerConfig: FooterConfig;
    iconSrc: string;
    isPasswordResetEnabled: boolean;
    orgName: string;
    prefix: string;
    productDescription: string;
    productName: string;

    privacyUrl?: string;
    termsUrl?: string;

    constructor({
        iconSrc,
        isPasswordResetEnabled = false,
        orgName = 'Beyonda Labs',
        prefix = 'angular-components.login',
        privacyUrl,
        productDescription,
        productName,
        termsUrl
    }: LoginConfigParameters) {
        this.footerConfig = new FooterConfig({
            iconSrc,
            orgName,
            privacyUrl,
            productName,
            termsUrl
        });
        this.iconSrc = iconSrc;
        this.isPasswordResetEnabled = isPasswordResetEnabled;
        this.orgName = orgName;
        this.prefix = prefix;
        this.privacyUrl = privacyUrl;
        this.productDescription = productDescription;
        this.productName = productName;
        this.termsUrl = termsUrl;
    }
}

export interface LoginConfigParameters {
    iconSrc: string;
    productDescription: string;
    productName: string;

    isPasswordResetEnabled?: boolean;
    orgName?: string;
    prefix?: string;
    privacyUrl?: string;
    termsUrl?: string;
}
