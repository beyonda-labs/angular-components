import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { readBlobError } from './blob-error';

function failedDownload(body: unknown): HttpErrorResponse {
    return new HttpErrorResponse({ error: body, status: 409, statusText: 'Conflict', url: '/files/1' });
}

describe('readBlobError', () => {
    it('reads the JSON body a failed download answers as a Blob', async () => {
        const blob = new Blob([JSON.stringify({ messageKey: 'attachments.content-not-set' })], {
            type: 'application/json'
        });

        const read = await firstValueFrom(readBlobError(failedDownload(blob)));

        expect(read.error).toEqual({ messageKey: 'attachments.content-not-set' });
        expect([read.status, read.statusText, read.url]).toEqual([409, 'Conflict', '/files/1']);
    });

    it('keeps the error as it came when the Blob is not JSON', async () => {
        const error = failedDownload(new Blob(['<html>Bad gateway</html>'], { type: 'text/html' }));

        await expect(firstValueFrom(readBlobError(error))).resolves.toBe(error);
    });

    it('lets an error without a Blob body through untouched', async () => {
        const error = failedDownload({ errorCode: 'not-found' });

        await expect(firstValueFrom(readBlobError(error))).resolves.toBe(error);
    });
});
