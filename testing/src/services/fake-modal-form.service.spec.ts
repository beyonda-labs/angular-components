import { TestBed } from '@angular/core/testing';
import { BeyFormRow, BeyFormSection, BeyFormTextField, BeyModalFormConfig } from '@beyonda-labs/angular-components';

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

    it('lets the route be left, since no dialog is really open', () => {
        modalForm.open(buildConfig());

        expect(modalForm.canDeactivate()).toBe(true);
    });
});
