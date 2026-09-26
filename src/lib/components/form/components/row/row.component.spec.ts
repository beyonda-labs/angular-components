import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormFieldState } from '../../form.component';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormRow } from '../../models/form.model';
import { FormRowComponent } from './row.component';

const VISIBLE: FormFieldState = { isDisabled: false, isHidden: false, isValid: true, options: [] };

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
            row: new FormRow({
                fields: [new FormTextField({ key: 'name', columns: 4 }), new FormTextField({ key: 'email' })]
            }),
            sectionKey: 'contact'
        });
    });

    it('renders the visible fields with the columns they ask for', () => {
        const fields = fixture.nativeElement.querySelectorAll('bey-form-field');

        expect(fields).toHaveLength(1);
        expect(fields[0].classList).toContain('col-4');
        expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();
    });
});
