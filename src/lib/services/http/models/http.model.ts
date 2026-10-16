import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

export interface CustomErrorResponse {
    readonly errorCode: string;
    readonly timestamp: string;

    readonly details?: Record<string, unknown>;
    readonly messageKey?: string;
    readonly messageParameters?: Record<string, unknown>;
}

export interface HttpClientOptions {
    headers?: HttpHeaders;
    params?: HttpParams;
    withCredentials?: boolean;
}

export interface HttpRequestOptions {
    handleError?: (error: HttpErrorResponse) => void;
    hasCredentials?: boolean;
    headers?: Record<string, string>;
    isLoading?: boolean;
    queryParams?: Record<string, string | number | boolean | string[]>;
    successToast?: string;
}

export interface UploadRequestOptions extends HttpRequestOptions {
    onProgress?: (progress: number) => void;
}
