import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextareaField } from '../../../models/fields/form-textarea-field.model';
import { FormTextareaFieldComponent } from './field-textarea.component';

describe('FormTextareaFieldComponent', () => {
    let fixture: ComponentFixture<FormTextareaFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormTextareaFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(FormTextareaFieldComponent);
        fixture.componentRef.setInput('control', new FormControl(''));
        fixture.componentRef.setInput('field', new FormTextareaField({ key: 'notes', rows: 5, maxHeight: '10rem' }));
        fixture.componentRef.setInput('prefix', 'demo.contact.notes');
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('renders a textarea with the rows and placeholder of the field', () => {
        const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

        expect(textarea.id).toBe('notes');
        expect(textarea.rows).toBe(5);
        expect(textarea.placeholder).toBe('demo.contact.notes.placeholder');
        expect(textarea.style.maxHeight).toBe('10rem');
    });
});
