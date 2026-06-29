export enum LoadingSize {
    Xs = 'xs',
    Sm = 'sm',
    Md = 'md',
    Lg = 'lg'
}

export const LOADING_SIZE_MAP: Record<LoadingSize, string> = {
    [LoadingSize.Xs]: '1rem',
    [LoadingSize.Sm]: '1.5rem',
    [LoadingSize.Md]: '2.5rem',
    [LoadingSize.Lg]: '4rem'
};
