export interface FooterConfigParameters {
    iconSrc: string;
    productName: string;

    orgName?: string;
    privacyUrl?: string;
    termsUrl?: string;
}

export class FooterConfig {
    iconSrc: string;
    orgName: string;
    productName: string;

    privacyUrl?: string;
    termsUrl?: string;

    constructor({ iconSrc, orgName = 'Beyonda Labs', privacyUrl, productName, termsUrl }: FooterConfigParameters) {
        this.iconSrc = iconSrc;
        this.orgName = orgName;
        this.privacyUrl = privacyUrl;
        this.productName = productName;
        this.termsUrl = termsUrl;
    }
}
