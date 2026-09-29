import { TestBed } from '@angular/core/testing';
import {
    BeyFormHandle,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyModalFormConfig
} from '@beyonda-labs/angular-components';
import { of } from 'rxjs';

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

    it('lets the route be left, since no dialog is really open', () => {
        modalForm.open(buildConfig());

        expect(modalForm.canDeactivate()).toBe(true);
    });
});
