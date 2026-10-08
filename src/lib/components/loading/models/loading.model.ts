export enum LoadingSize {
    Lg = 'lg',
    Md = 'md',
    Sm = 'sm',
    Xs = 'xs'
}

export const LOADING_SIZE_MAP: Record<LoadingSize, string> = {
    [LoadingSize.Xs]: '1rem',
    [LoadingSize.Sm]: '1.5rem',
    [LoadingSize.Md]: '2.5rem',
    [LoadingSize.Lg]: '4rem'
};
