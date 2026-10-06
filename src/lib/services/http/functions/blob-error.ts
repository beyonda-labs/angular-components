import { HttpErrorResponse } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';

export function readBlobError(error: HttpErrorResponse): Observable<HttpErrorResponse> {
    if (!(error.error instanceof Blob)) {
        return of(error);
    }

    return from(
        readText(error.error).then(
            text => withBody(error, parseJson(text)),
            () => error
        )
    );
}

function parseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function readText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => resolve(String(reader.result)));
        reader.addEventListener('error', () => reject(reader.error ?? new Error('unreadable')));
        reader.readAsText(blob);
    });
}

function withBody(error: HttpErrorResponse, body: unknown): HttpErrorResponse {
    if (typeof body !== 'object' || body === null) {
        return error;
    }

    return new HttpErrorResponse({
        error: body,
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined
    });
}
