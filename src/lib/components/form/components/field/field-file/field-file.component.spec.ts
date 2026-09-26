import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { FormFileField } from '../../../models/fields/form-file-field.model';
import { FormFileFieldComponent } from './field-file.component';

describe('FormFileFieldComponent', () => {
    let fixture: ComponentFixture<FormFileFieldComponent>;
    let control: FormControl<File | null>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormFileFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<File | null>(null);
        fixture = await renderComponent(FormFileFieldComponent, {
            control,
            field: new FormFileField({ key: 'attachment', accept: ['.pdf'] })
        });
    });

    it('shows the chosen file and clears it again', async () => {
        const file = new File(['pdf'], 'invoice.pdf', { type: 'application/pdf' });
        const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

        expect(fixture.nativeElement.textContent).toContain('angular-components.form.file-field.empty');
        expect(input.accept).toBe('.pdf');

        Object.defineProperty(input, 'files', { value: [file] });
        input.dispatchEvent(new Event('change'));
        await settle(fixture);

        expect(control.value).toBe(file);
        expect(fixture.nativeElement.textContent).toContain('invoice.pdf');

        buttonByName(fixture, 'angular-components.form.file-field.clear').click();

        expect(control.value).toBeNull();
    });
});
