export interface StyleGuideRegion {
    isProOnly: boolean;
    key: string;
}

export const STYLE_GUIDE_REGIONS: StyleGuideRegion[] = [
    { isProOnly: false, key: 'eu' },
    { isProOnly: true, key: 'us' },
    { isProOnly: true, key: 'asia' }
];
