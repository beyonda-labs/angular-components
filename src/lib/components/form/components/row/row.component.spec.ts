import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { queryControl, renderComponent } from '@testing/dom';

import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormRow } from '../../models/form.model';
import { FormFieldState } from '../../models/form-field-state.model';
import { FormRowComponent } from './row.component';

const VISIBLE: FormFieldState = {
    excludedValues: [],
    isDisabled: false,
    isHidden: false,
    isRequired: false,
    isValid: true,
    options: []
};

describe('FormRowComponent', () => {
    let fixture: ComponentFixture<FormRowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormRowComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(FormRowComponent, {
            fieldStates: new Map([
                ['contact.name', VISIBLE],
                ['contact.email', { ...VISIBLE, isHidden: true }]
            ]),
            group: new FormGroup({ name: new FormControl(''), email: new FormControl('') }),
            prefix: 'demo.contact',
            row: new FormRow({ fields: [new FormTextField({ key: 'name' }), new FormTextField({ key: 'email' })] }),
            sectionKey: 'contact'
        });
    });

    it('renders the visible fields and leaves the hidden ones out', () => {
        expect(queryControl(fixture, 'demo.contact.name.label')).not.toBeNull();
        expect(queryControl(fixture, 'demo.contact.email.label')).toBeNull();
    });
});
