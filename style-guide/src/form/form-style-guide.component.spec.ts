import { ComponentFixture, TestBed } from '@angular/core/testing';
import { queryButton, renderComponent } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormStyleGuideComponent } from './form-style-guide.component';

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
        expect(fixture.nativeElement.textContent).toContain('angular-components-style-guide.form.example');
        expect(queryButton(fixture, 'angular-components-style-guide.form.modal.open')).not.toBeNull();
    });
});
