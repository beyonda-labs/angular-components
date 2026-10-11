import { TestBed } from '@angular/core/testing';
import {
    BeyFormHandle,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyModalFormConfig
} from '@beyonda-labs/angular-components';
import { config as rxjsConfig, of, throwError } from 'rxjs';

import { FakeModalFormService } from './fake-modal-form.service';

describe('FakeModalFormService', () => {
    let modalForm: FakeModalFormService;

    function buildConfig(): BeyModalFormConfig<{ contact: { name: string } }> {
        return new BeyModalFormConfig({
            prefix: 'contacts.form',
            sections: [
                new BeyFormSection({
                    key: 'contact',
                    rows: [new BeyFormRow({ fields: [new BeyFormTextField({ key: 'name' })] })]
                })
            ]
        });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [FakeModalFormService] });
        modalForm = TestBed.inject(FakeModalFormService);
    });

    it('records the forms it is asked to open, so a spec can reach their callbacks', () => {
        const config = buildConfig();

        modalForm.open(config);

        expect(modalForm.forms()).toEqual([config]);
    });

    it('records a form with its own request, whose submit sends it and closes once it answers', () => {
        const close = jest.fn();
        const submit = jest.fn(() => of(null));

        modalForm.openWithRequest(buildConfig(), submit);
        modalForm.forms()[0].onSubmit?.({ contact: { name: 'Ada' } }, { close } as unknown as BeyFormHandle);

        expect(submit).toHaveBeenCalledWith({ contact: { name: 'Ada' } });
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('keeps a form with its own request open, leaving no error unhandled, when the request fails', async () => {
        const previousHandler = rxjsConfig.onUnhandledError;
        const close = jest.fn();
        const unhandled = jest.fn();

        modalForm.openWithRequest(buildConfig(), () => throwError(() => new Error('refused')));
        rxjsConfig.onUnhandledError = unhandled;

        try {
            modalForm.forms()[0].onSubmit?.({ contact: { name: 'Ada' } }, { close } as unknown as BeyFormHandle);
            await new Promise(resolve => {
                setTimeout(resolve);
            });
        } finally {
            rxjsConfig.onUnhandledError = previousHandler;
        }

        expect(unhandled).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
    });

    it('lets the route be left, since no dialog is really open', () => {
        modalForm.open(buildConfig());

        expect(modalForm.canDeactivate()).toBe(true);
    });
});
