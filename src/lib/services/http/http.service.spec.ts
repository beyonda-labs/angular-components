import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { Observable, throwError } from 'rxjs';

import translations from '../../assets/i18n/angular-components.en.json';
import { LoadingService } from '../../components/loading/services/loading.service';
import { HttpService } from './http.service';
import { HttpRequestOptions, UploadRequestOptions } from './models/http.model';

interface ErrorCase {
    message: string;
    messageParameters: Record<string, string>;
    name: string;
    respond: (request: TestRequest) => void;
    texts: [string, string];
    title: string;
}

interface MethodCase {
    method: string;
    name: string;
    send: (service: HttpService, options: UploadRequestOptions) => Observable<unknown>;
}

const URL = '/api/items';
const ERROR = 'angular-components.http.error.';
const TITLE = 'angular-components.http.title.';
const UNKNOWN_TEXTS: [string, string] = ['Unexpected error', 'An unexpected error occurred. Please try again later.'];

function failWith(status: number, body: unknown): (request: TestRequest) => void {
    return request => request.flush(body as object, { status, statusText: 'Error' });
}

function failWithRange(errorCode: string, min: number | null, max: number | null): (request: TestRequest) => void {
    return failWith(400, { errorCode, messageParameters: { fieldName: 'name', max, min } });
}

const ERROR_CASES: ErrorCase[] = [
    {
        name: 'a message key with its own title',
        respond: failWith(401, { errorCode: 'invalid-credentials', messageKey: 'login.invalid-credentials' }),
        title: `${TITLE}login.invalid-credentials`,
        message: `${ERROR}login.invalid-credentials`,
        messageParameters: {},
        texts: ['Authentication failed', 'Invalid email or password.']
    },
    {
        name: 'a message key without a title',
        respond: failWith(400, { messageKey: 'unmapped-message' }),
        title: `${TITLE}default`,
        message: `${ERROR}unmapped-message`,
        messageParameters: {},
        texts: ['Error', `${ERROR}unmapped-message`]
    },
    {
        name: 'a message key with parameters',
        respond: failWith(409, {
            messageKey: 'duplicate-field',
            messageParameters: { fieldName: 'name', value: 'Foo' }
        }),
        title: `${TITLE}duplicate-field`,
        message: `${ERROR}duplicate-field`,
        messageParameters: { fieldName: 'Name', value: 'Foo' },
        texts: ['Duplicate value', 'An item with field "Name" and value "Foo" already exists.']
    },
    {
        name: 'a message key next to an error code',
        respond: failWith(409, { errorCode: 'not-found', messageKey: 'conflict' }),
        title: `${TITLE}conflict`,
        message: `${ERROR}conflict`,
        messageParameters: {},
        texts: ['Conflict', 'A conflict occurred with the current state of the resource.']
    },
    {
        name: 'a translated error code',
        respond: failWith(404, { errorCode: 'not-found' }),
        title: `${TITLE}not-found`,
        message: `${ERROR}not-found`,
        messageParameters: {},
        texts: ['Not found', 'The requested resource was not found.']
    },
    {
        name: 'a nested error code',
        respond: failWith(422, { errorCode: 'document-generation.pagination-stuck' }),
        title: `${TITLE}document-generation.pagination-stuck`,
        message: `${ERROR}document-generation.pagination-stuck`,
        messageParameters: {},
        texts: [
            'Pagination error',
            'The document could not be paginated correctly. Check the content: an item may be too large or misconfigured.'
        ]
    },
    {
        name: 'an error code with a translated field name',
        respond: failWith(400, { errorCode: 'required-field', messageParameters: { fieldName: 'name' } }),
        title: `${TITLE}required-field`,
        message: `${ERROR}required-field`,
        messageParameters: { fieldName: 'Name' },
        texts: ['Required field', 'The field "Name" is required.']
    },
    {
        name: 'an error code with a nested field name',
        respond: failWith(400, { errorCode: 'required-field', messageParameters: { fieldName: 'login.email' } }),
        title: `${TITLE}required-field`,
        message: `${ERROR}required-field`,
        messageParameters: { fieldName: 'Email' },
        texts: ['Required field', 'The field "Email" is required.']
    },
    {
        name: 'an error code with an untranslated field name',
        respond: failWith(400, { errorCode: 'required-field', messageParameters: { fieldName: 'unmapped-field' } }),
        title: `${TITLE}required-field`,
        message: `${ERROR}required-field`,
        messageParameters: { fieldName: 'unmapped-field' },
        texts: ['Required field', 'The field "unmapped-field" is required.']
    },
    {
        name: 'an error code with parameters that are not strings',
        respond: failWith(400, {
            errorCode: 'invalid-field-type',
            messageParameters: { count: 3, empty: null, expectedType: 'number', fieldName: 'name', flag: true }
        }),
        title: `${TITLE}invalid-field-type`,
        message: `${ERROR}invalid-field-type`,
        messageParameters: { count: '3', empty: 'null', expectedType: 'number', fieldName: 'Name', flag: 'true' },
        texts: ['Invalid field type', 'The field "Name" must be of type "number".']
    },
    {
        name: 'an unknown error code',
        respond: failWith(400, { errorCode: 'unrecognized-error' }),
        title: `${TITLE}default`,
        message: `${ERROR}unknown`,
        messageParameters: {},
        texts: ['Error', 'An unexpected error occurred. Please try again later.']
    },
    {
        name: 'a range with both limits',
        respond: failWithRange('invalid-field-range', 0, 100),
        title: `${TITLE}invalid-field-range`,
        message: `${ERROR}invalid-field-range`,
        messageParameters: { fieldName: 'Name', max: '100', min: '0' },
        texts: ['Value out of range', 'The field "Name" must be between 0 and 100.']
    },
    {
        name: 'a range with only a minimum',
        respond: failWithRange('invalid-field-range', 5, null),
        title: `${TITLE}invalid-field-range`,
        message: `${ERROR}invalid-field-range-min`,
        messageParameters: { fieldName: 'Name', max: 'null', min: '5' },
        texts: ['Value out of range', 'The field "Name" must be at least 5.']
    },
    {
        name: 'a range with only a maximum',
        respond: failWithRange('invalid-field-range', null, 100),
        title: `${TITLE}invalid-field-range`,
        message: `${ERROR}invalid-field-range-max`,
        messageParameters: { fieldName: 'Name', max: '100', min: 'null' },
        texts: ['Value out of range', 'The field "Name" must be at most 100.']
    },
    {
        name: 'a range without limits',
        respond: failWithRange('invalid-field-range', null, null),
        title: `${TITLE}invalid-field-range`,
        message: `${ERROR}invalid-field-range-max`,
        messageParameters: { fieldName: 'Name', max: 'null', min: 'null' },
        texts: ['Value out of range', 'The field "Name" must be at most null.']
    },
    {
        name: 'a range without parameters',
        respond: failWith(400, { errorCode: 'invalid-field-range' }),
        title: `${TITLE}invalid-field-range`,
        message: `${ERROR}invalid-field-range`,
        messageParameters: {},
        texts: ['Value out of range', 'The field "{{fieldName}}" must be between {{min}} and {{max}}.']
    },
    {
        name: 'a length with both limits',
        respond: failWithRange('invalid-field-length', 3, 50),
        title: `${TITLE}invalid-field-length`,
        message: `${ERROR}invalid-field-length`,
        messageParameters: { fieldName: 'Name', max: '50', min: '3' },
        texts: ['Invalid length', 'The field "Name" must be between 3 and 50 characters long.']
    },
    {
        name: 'a length with only a minimum',
        respond: failWithRange('invalid-field-length', 3, null),
        title: `${TITLE}invalid-field-length`,
        message: `${ERROR}invalid-field-length-min`,
        messageParameters: { fieldName: 'Name', max: 'null', min: '3' },
        texts: ['Invalid length', 'The field "Name" must be at least 3 characters long.']
    },
    {
        name: 'a length with only a maximum',
        respond: failWithRange('invalid-field-length', null, 50),
        title: `${TITLE}invalid-field-length`,
        message: `${ERROR}invalid-field-length-max`,
        messageParameters: { fieldName: 'Name', max: '50', min: 'null' },
        texts: ['Invalid length', 'The field "Name" must be at most 50 characters long.']
    },
    {
        name: 'a body that is not JSON',
        respond: failWith(502, '<html>Bad gateway</html>'),
        title: `${TITLE}unknown`,
        message: `${ERROR}unknown`,
        messageParameters: {},
        texts: UNKNOWN_TEXTS
    },
    {
        name: 'no body',
        respond: failWith(500, null),
        title: `${TITLE}unknown`,
        message: `${ERROR}unknown`,
        messageParameters: {},
        texts: UNKNOWN_TEXTS
    },
    {
        name: 'an empty body',
        respond: failWith(500, {}),
        title: `${TITLE}unknown`,
        message: `${ERROR}unknown`,
        messageParameters: {},
        texts: UNKNOWN_TEXTS
    },
    {
        name: 'a network error',
        respond: request => request.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' }),
        title: `${TITLE}unknown`,
        message: `${ERROR}unknown`,
        messageParameters: {},
        texts: UNKNOWN_TEXTS
    }
];

const METHOD_CASES: MethodCase[] = [
    { name: 'get', method: 'GET', send: (service, options) => service.get(URL, options) },
    { name: 'post', method: 'POST', send: (service, options) => service.post(URL, { a: 1 }, options) },
    { name: 'put', method: 'PUT', send: (service, options) => service.put(URL, { a: 1 }, options) },
    { name: 'patch', method: 'PATCH', send: (service, options) => service.patch(URL, { a: 1 }, options) },
    { name: 'delete', method: 'DELETE', send: (service, options) => service.delete(URL, { ids: [1] }, options) },
    { name: 'upload', method: 'PUT', send: (service, options) => service.upload(URL, new Blob(['bytes']), options) }
];
const DOWNLOAD_CASES: MethodCase[] = [
    { name: 'getBlob', method: 'GET', send: (service, options) => service.getBlob(URL, options) },
    { name: 'postBlob', method: 'POST', send: (service, options) => service.postBlob(URL, { a: 1 }, options) }
];

describe('HttpService', () => {
    let httpTesting: HttpTestingController;
    let loading: LoadingService;
    let modal: FakeModalService;
    let service: HttpService;
    let toast: FakeToastService;
    let translate: TranslateService;

    function expectRequest(method: string): TestRequest {
        return httpTesting.expectOne(request => request.method === method && request.url === URL);
    }

    function downloadFailure({ send }: MethodCase, options: HttpRequestOptions = {}): Promise<unknown> {
        return new Promise(resolve => {
            send(service, options).subscribe({ error: resolve });
        });
    }

    function ignore(): void {
        return undefined;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting({ translations: { en: translations } })] });

        httpTesting = TestBed.inject(HttpTestingController);
        loading = TestBed.inject(LoadingService);
        modal = TestBed.inject(FakeModalService);
        service = TestBed.inject(HttpService);
        toast = TestBed.inject(FakeToastService);
        translate = TestBed.inject(TranslateService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    describe('requests', () => {
        it('sends a GET and emits its body typed as asked', () => {
            const names: string[] = [];

            service.get<{ name: string }>(URL).subscribe(item => names.push(item.name));
            expectRequest('GET').flush({ name: 'Ada' });

            expect(names).toEqual(['Ada']);
        });

        it.each([
            ['POST', (body: unknown) => service.post(URL, body)],
            ['PUT', (body: unknown) => service.put(URL, body)],
            ['PATCH', (body: unknown) => service.patch(URL, body)],
            ['DELETE', (body: unknown) => service.delete(URL, body)]
        ])('sends a %s with its body and emits the response', (method, send) => {
            const received = jest.fn();

            send({ ids: [1] }).subscribe(received);
            const request = expectRequest(method);
            request.flush({ id: 1 });

            expect(request.request.body).toEqual({ ids: [1] });
            expect(received).toHaveBeenCalledWith({ id: 1 });
        });

        it('reads the body of getBlob as a Blob', () => {
            const content = new Blob(['content'], { type: 'text/plain' });
            const received = jest.fn();

            service.getBlob(URL).subscribe(received);
            const request = expectRequest('GET');
            request.flush(content);

            expect(request.request.responseType).toBe('blob');
            expect(received).toHaveBeenCalledWith(content);
        });

        it('sends the body of postBlob and reads its response as a Blob', () => {
            const content = new Blob(['%PDF-'], { type: 'application/pdf' });
            const received = jest.fn();

            service.postBlob(URL, { sections: [] }).subscribe(received);
            const request = expectRequest('POST');
            request.flush(content);

            expect(request.request.body).toEqual({ sections: [] });
            expect(request.request.responseType).toBe('blob');
            expect(received).toHaveBeenCalledWith(content);
        });

        it('uploads with a PUT, reports the fraction sent and emits the response body', () => {
            const progress: number[] = [];
            const received = jest.fn();
            const bytes = new Blob(['bytes']);

            service
                .upload<{ id: string }>(URL, bytes, {
                    headers: { 'Content-Type': 'application/pdf' },
                    onProgress: value => progress.push(value)
                })
                .subscribe(received);
            const request = expectRequest('PUT');
            request.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
            request.event({ type: HttpEventType.UploadProgress, loaded: 7 });
            request.flush({ id: 'a' });

            expect(request.request.body).toBe(bytes);
            expect(request.request.headers.get('Content-Type')).toBe('application/pdf');
            expect(progress).toEqual([0.5, 0]);
            expect(received).toHaveBeenCalledWith({ id: 'a' });
        });

        it('sends the query params, repeating an array once per value, and the headers', () => {
            service
                .get(URL, { headers: { 'X-Custom': 'value' }, queryParams: { active: true, ids: ['1', '2'], page: 1 } })
                .subscribe();
            const request = expectRequest('GET');
            const { headers, params } = request.request;
            request.flush([]);

            expect(params.get('active')).toBe('true');
            expect(params.getAll('ids')).toEqual(['1', '2']);
            expect(params.get('page')).toBe('1');
            expect(headers.get('X-Custom')).toBe('value');
        });
    });

    describe('subscription', () => {
        it('sends nothing, and shows no loading, until something subscribes', () => {
            const items$ = service.get(URL, { loading: true });

            httpTesting.expectNone(URL);
            expect(loading.isLoading()).toBe(false);

            items$.subscribe();
            expectRequest('GET').flush([]);
        });

        it('sends one request per subscription', () => {
            const items$ = service.get(URL, { successToast: 'items.loaded' });

            items$.subscribe();
            items$.subscribe();
            const requests = httpTesting.match(URL);
            requests.forEach(request => request.flush([]));

            expect(requests).toHaveLength(2);
            expect(toast.successes()).toEqual([{ message: 'items.loaded' }, { message: 'items.loaded' }]);
        });

        it('cancels the request, without a modal or a toast, when the subscriber unsubscribes', () => {
            const subscription = service.get(URL, { successToast: 'items.loaded' }).subscribe();
            const request = expectRequest('GET');

            subscription.unsubscribe();

            expect(request.cancelled).toBe(true);
            expect(modal.errors()).toEqual([]);
            expect(toast.successes()).toEqual([]);
        });
    });

    describe('loading', () => {
        it('shows the loading while the request is out and hides it after a success', () => {
            const show = jest.spyOn(loading, 'show');
            const hide = jest.spyOn(loading, 'hide');

            service.get(URL, { loading: true }).subscribe();

            expect(loading.isLoading()).toBe(true);

            expectRequest('GET').flush({ id: 1 });

            expect(loading.isLoading()).toBe(false);
            expect([show.mock.calls.length, hide.mock.calls.length]).toEqual([1, 1]);
        });

        it('hides the loading after an error', () => {
            service.get(URL, { loading: true }).subscribe({ error: ignore });

            expect(loading.isLoading()).toBe(true);

            failWith(500, null)(expectRequest('GET'));

            expect(loading.isLoading()).toBe(false);
        });

        it('hides the loading when the request is cancelled', () => {
            const subscription = service.get(URL, { loading: true }).subscribe();
            expectRequest('GET');

            subscription.unsubscribe();

            expect(loading.isLoading()).toBe(false);
        });

        it.each([{}, { loading: false }])('shows no loading with the options %j', options => {
            const show = jest.spyOn(loading, 'show');

            service.get(URL, options).subscribe();

            expect(loading.isLoading()).toBe(false);
            expectRequest('GET').flush(null);
            expect(show).not.toHaveBeenCalled();
        });
    });

    describe('success toast', () => {
        it('shows the success toast with its translation key', () => {
            service.post(URL, {}, { successToast: 'items.created' }).subscribe();
            expectRequest('POST').flush({ id: 1 });

            expect(toast.successes()).toEqual([{ message: 'items.created' }]);
        });

        it('shows no toast when successToast is not set', () => {
            service.post(URL, {}).subscribe();
            expectRequest('POST').flush({ id: 1 });

            expect(toast.successes()).toEqual([]);
        });

        it('shows no success toast, but the error modal, when the request fails', () => {
            service.post(URL, {}, { successToast: 'items.created' }).subscribe({ error: ignore });
            failWith(500, { errorCode: 'internal-server-error' })(expectRequest('POST'));

            expect(toast.successes()).toEqual([]);
            expect(toast.errors()).toEqual([]);
            expect(modal.errors()).toEqual([
                {
                    message: `${ERROR}internal-server-error`,
                    messageParameters: {},
                    title: `${TITLE}internal-server-error`
                }
            ]);
        });
    });

    describe('error modal', () => {
        it.each(ERROR_CASES)(
            'opens the error modal with the texts of $name',
            ({ message, messageParameters, respond, texts, title }) => {
                service.get(URL).subscribe({ error: ignore });
                respond(expectRequest('GET'));

                expect(modal.errors()).toEqual([{ message, messageParameters, title }]);
                expect([translate.instant(title), translate.instant(message, messageParameters)]).toEqual(texts);
            }
        );

        it.each(METHOD_CASES)('opens the error modal when a $name request fails', ({ method, send }) => {
            send(service, {}).subscribe({ error: ignore });
            failWith(404, { errorCode: 'not-found' })(expectRequest(method));

            expect(modal.errors()).toEqual([
                { message: `${ERROR}not-found`, messageParameters: {}, title: `${TITLE}not-found` }
            ]);
        });

        it.each(DOWNLOAD_CASES)('reads the reason of a failed $name from its Blob body', async download => {
            const failed = downloadFailure(download, { loading: true });

            failWith(
                404,
                new Blob([JSON.stringify({ errorCode: 'not-found' })], { type: 'application/json' })
            )(expectRequest(download.method));
            await failed;

            expect(modal.errors()).toEqual([
                { message: `${ERROR}not-found`, messageParameters: {}, title: `${TITLE}not-found` }
            ]);
            expect(loading.isLoading()).toBe(false);
        });

        it.each(DOWNLOAD_CASES)(
            'opens the unknown error modal when a failed $name has no readable reason',
            async download => {
                const failed = downloadFailure(download);

                failWith(502, new Blob(['Bad gateway'], { type: 'text/plain' }))(expectRequest(download.method));
                await failed;

                expect(modal.errors()).toEqual([
                    { message: `${ERROR}unknown`, messageParameters: {}, title: `${TITLE}unknown` }
                ]);
            }
        );
    });

    describe('errors', () => {
        it('hands the subscriber the HttpErrorResponse once the modal is open', () => {
            const received: { modals: number; status: number }[] = [];

            service.get(URL).subscribe({
                error: (error: HttpErrorResponse) =>
                    received.push({ modals: modal.errors().length, status: error.status })
            });
            failWith(404, { errorCode: 'not-found' })(expectRequest('GET'));

            expect(received).toEqual([{ modals: 1, status: 404 }]);
        });

        it('runs handleError instead of the modal and then hands the subscriber the same error', () => {
            const handled: HttpErrorResponse[] = [];
            const received: HttpErrorResponse[] = [];

            service
                .post(
                    URL,
                    {},
                    { handleError: error => handled.push(error), loading: true, successToast: 'items.created' }
                )
                .subscribe({ error: (error: HttpErrorResponse) => received.push(error) });
            failWith(403, { errorCode: 'forbidden' })(expectRequest('POST'));

            expect(handled).toEqual([expect.any(HttpErrorResponse)]);
            expect(handled[0].status).toBe(403);
            expect(received[0]).toBe(handled[0]);
            expect(modal.errors()).toEqual([]);
            expect(toast.successes()).toEqual([]);
            expect(loading.isLoading()).toBe(false);
        });

        it('emits nothing and does not complete after an error', () => {
            const complete = jest.fn();
            const next = jest.fn();

            service.get(URL).subscribe({ complete, error: ignore, next });
            failWith(500, null)(expectRequest('GET'));

            expect(next).not.toHaveBeenCalled();
            expect(complete).not.toHaveBeenCalled();
        });
    });

    describe('unhandled errors', () => {
        it('raises nothing for a shown error that the subscriber does not handle', fakeAsync(() => {
            service.get(URL).subscribe();
            failWith(500, null)(expectRequest('GET'));

            expect(() => flush()).not.toThrow();
            expect(modal.errors()).toHaveLength(1);
        }));

        it('raises nothing for an error that handleError took care of', fakeAsync(() => {
            service.get(URL, { handleError: ignore }).subscribe();
            failWith(500, null)(expectRequest('GET'));

            expect(() => flush()).not.toThrow();
        }));

        it('lets an error that was not shown reach the default handling of rxjs', fakeAsync(() => {
            throwError(() => new Error('not shown')).subscribe();

            expect(() => flush()).toThrow('not shown');
        }));
    });
});
