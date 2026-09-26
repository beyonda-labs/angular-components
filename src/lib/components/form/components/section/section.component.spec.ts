import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormFieldState } from '../../form.component';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormRow, FormSection, FormSectionParameters } from '../../models/form.model';
import { FormSectionComponent } from './section.component';

const VISIBLE: FormFieldState = { isDisabled: false, isHidden: false, isValid: true, options: [] };
const HIDDEN: FormFieldState = { ...VISIBLE, isHidden: true };
const ALL_VISIBLE: Record<string, FormFieldState> = { 'contact.name': VISIBLE, 'contact.email': VISIBLE };

describe('FormSectionComponent', () => {
    let fixture: ComponentFixture<FormSectionComponent>;

    async function render(
        overrides: Partial<FormSectionParameters> = {},
        states: Record<string, FormFieldState> = ALL_VISIBLE
    ): Promise<void> {
        fixture = await renderComponent(FormSectionComponent, {
            fieldStates: new Map(Object.entries(states)),
            group: new FormGroup({ name: new FormControl(''), email: new FormControl('') }),
            prefix: 'demo',
            section: new FormSection({
                key: 'contact',
                rows: [
                    new FormRow({ fields: [new FormTextField({ key: 'name' })] }),
                    new FormRow({ fields: [new FormTextField({ key: 'email' })] })
                ],
                ...overrides
            })
        });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormSectionComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('shows the title from the prefix and the section key, and one row per row with a visible field', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('demo.contact.label');
        expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(2);
    });

    it('resolves the texts from its own prefix when the section names one', async () => {
        await render({ prefix: 'person' });

        expect(fixture.nativeElement.textContent).toContain('demo.person.label');
        expect(fixture.nativeElement.textContent).toContain('demo.person.name.label');
    });

    it('hides the title when asked, and skips a row with no visible field', async () => {
        await render({ isTitleVisible: false }, { 'contact.name': VISIBLE, 'contact.email': HIDDEN });

        expect(fixture.nativeElement.textContent).not.toContain('demo.contact.label');
        expect(fixture.nativeElement.querySelectorAll('input')).toHaveLength(1);
    });
});
