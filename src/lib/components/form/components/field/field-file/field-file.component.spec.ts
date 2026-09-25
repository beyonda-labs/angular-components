import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
        fixture = TestBed.createComponent(FormFileFieldComponent);
        fixture.componentRef.setInput('control', control);
        fixture.componentRef.setInput('field', new FormFileField({ key: 'attachment', accept: ['.pdf'] }));
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('shows the chosen file and clears it again', async () => {
        const file = new File(['pdf'], 'invoice.pdf', { type: 'application/pdf' });
        const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;

        expect(fixture.nativeElement.textContent).toContain('angular-components.form.fileField.empty');
        expect(input.accept).toBe('.pdf');

        Object.defineProperty(input, 'files', { value: [file] });
        input.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(control.value).toBe(file);
        expect(fixture.nativeElement.textContent).toContain('invoice.pdf');

        (fixture.nativeElement.querySelector('.bey-file-clear') as HTMLButtonElement).click();

        expect(control.value).toBeNull();
    });
});
