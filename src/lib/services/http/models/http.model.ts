import { HttpErrorResponse } from '@angular/common/http';

export interface HttpRequestOptions {
    handleError?: (error: HttpErrorResponse) => void;
    headers?: Record<string, string>;
    loading?: boolean;
    onError?: (error: HttpErrorResponse) => void;
    onSuccess?: (result: unknown) => void;
    queryParams?: Record<string, string | number | boolean | string[]>;
    successToast?: string;
}

export interface CustomErrorResponse {
    readonly errorCode: string;
    readonly timestamp: string;

    readonly message?: string;
    readonly messageParameters?: Record<string, unknown>;
}
