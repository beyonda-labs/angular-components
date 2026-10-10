import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleDescription, buttonByName, controlByName, queryButton, renderComponent } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormStyleGuideComponent } from './form-style-guide.component';

const PREFIX = 'angular-components-style-guide.form';

describe('FormStyleGuideComponent', () => {
    let fixture: ComponentFixture<FormStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormStyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(FormStyleGuideComponent);
    });

    it('shows the form example and the button that opens the modal form', () => {
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.example`);
        expect(queryButton(fixture, `${PREFIX}.modal.open`)).not.toBeNull();
    });

    it('shows a hint under a field and a note next to the buttons, which describes the submit button', () => {
        expect(accessibleDescription(controlByName(fixture, `${PREFIX}.section-password.password1.label`))).toBe(
            `${PREFIX}.section-password.password1.hint`
        );
        expect(accessibleDescription(buttonByName(fixture, `${PREFIX}.button.submit`))).toBe(`${PREFIX}.footer.note`);
    });

    it('lists every rule of a password policy under the field that has one', () => {
        const description = accessibleDescription(controlByName(fixture, `${PREFIX}.section-password.password5.label`));

        for (const rule of ['length', 'uppercase', 'lowercase', 'digit', 'symbol']) {
            expect(description).toContain(`angular-components.form.password-field.policy.${rule}`);
        }
    });
});
