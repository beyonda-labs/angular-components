import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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

    it('shows the size of the chosen file and the largest size allowed', async () => {
        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', {
            'angular-components': { form: { 'file-field': { 'max-size': 'Up to {{maxSize}}' } } }
        });
        translate.use('en');
        fixture = await renderComponent(FormFileFieldComponent, {
            control,
            field: new FormFileField({ key: 'attachment', maxSizeBytes: 2 * 1024 * 1024 })
        });
        const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', { value: [new File(['x'.repeat(1536)], 'notes.txt')] });
        input.dispatchEvent(new Event('change'));
        await settle(fixture);

        expect(fixture.nativeElement.textContent).toContain('1.5 KB');
        expect(fixture.nativeElement.textContent).toContain('Up to 2.0 MB');
    });
});
