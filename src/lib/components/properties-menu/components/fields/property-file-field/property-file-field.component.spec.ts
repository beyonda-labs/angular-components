import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyFileField } from '../../../models/fields/property-file-field.model';
import { PropertyFileFieldComponent } from './property-file-field.component';

describe('PropertyFileFieldComponent', () => {
    let component: PropertyFileFieldComponent;
    let fixture: ComponentFixture<PropertyFileFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFileFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyFileFieldComponent);
        component = fixture.componentInstance;
    });

    it('shows the empty state and no clear button when the value is unset', () => {
        component.field = new PropertyFileField({ id: 'source', value: '' });
        fixture.detectChanges();

        const name = fixture.nativeElement.querySelector('.bey-property-file-field-name');

        expect(name.classList.contains('bey-property-file-field-name-empty')).toBe(true);
        expect(fixture.nativeElement.querySelector('.bey-property-field-variable-trigger')).toBeFalsy();
    });

    it('shows a clear button once a value is set', () => {
        component.field = new PropertyFileField({ id: 'source', value: 'AAAA' });
        fixture.detectChanges();

        const name = fixture.nativeElement.querySelector('.bey-property-file-field-name');

        expect(name.classList.contains('bey-property-file-field-name-empty')).toBe(false);
        expect(fixture.nativeElement.querySelector('.bey-property-field-variable-trigger')).toBeTruthy();
    });

    it('emits an empty string when the clear button is clicked', () => {
        component.field = new PropertyFileField({ id: 'source', value: 'AAAA' });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-field-variable-trigger');

        clearButton.click();

        expect(emitSpy).toHaveBeenCalledWith('');
        expect(component.selectedFileName).toBeUndefined();
    });

    it('reads the chosen file as base64 and emits it without the data URI prefix', done => {
        component.field = new PropertyFileField({ id: 'source', accept: 'application/pdf', value: '' });
        fixture.detectChanges();

        component.valueChange.subscribe((value: string) => {
            expect(value).toBe('AQID');
            expect(component.selectedFileName).toBe('sample.pdf');
            done();
        });

        const file = new File([new Uint8Array([1, 2, 3])], 'sample.pdf', { type: 'application/pdf' });
        const input = document.createElement('input');
        Object.defineProperty(input, 'files', { value: [file] });

        component.onFileSelected({ target: input } as unknown as Event);
    });

    it('rejects a file larger than maxSizeBytes without reading or emitting it', () => {
        component.field = new PropertyFileField({ id: 'source', value: '', maxSizeBytes: 2 });
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        const file = new File([new Uint8Array([1, 2, 3])], 'too-big.pdf', { type: 'application/pdf' });
        const input = document.createElement('input');
        Object.defineProperty(input, 'files', { value: [file] });

        component.onFileSelected({ target: input } as unknown as Event);
        fixture.detectChanges();

        expect(emitSpy).not.toHaveBeenCalled();
        expect(component.selectedFileName).toBeUndefined();
        expect(component.sizeErrorMaxSizeMB).toBe(0);
        expect(fixture.nativeElement.querySelector('.bey-property-file-field-size-error')).toBeTruthy();
    });

    it('accepts a file at or under maxSizeBytes', done => {
        component.field = new PropertyFileField({ id: 'source', value: '', maxSizeBytes: 10 });
        fixture.detectChanges();

        component.valueChange.subscribe((value: string) => {
            expect(value).toBe('AQID');
            expect(component.sizeErrorMaxSizeMB).toBeUndefined();
            done();
        });

        const file = new File([new Uint8Array([1, 2, 3])], 'sample.pdf', { type: 'application/pdf' });
        const input = document.createElement('input');
        Object.defineProperty(input, 'files', { value: [file] });

        component.onFileSelected({ target: input } as unknown as Event);
    });

    it('clears the size error once a valid file is picked', () => {
        component.field = new PropertyFileField({ id: 'source', value: '', maxSizeBytes: 2 });
        fixture.detectChanges();

        const oversized = new File([new Uint8Array([1, 2, 3])], 'too-big.pdf', { type: 'application/pdf' });
        const oversizedInput = document.createElement('input');
        Object.defineProperty(oversizedInput, 'files', { value: [oversized] });
        component.onFileSelected({ target: oversizedInput } as unknown as Event);

        expect(component.sizeErrorMaxSizeMB).toBeDefined();

        component.field = new PropertyFileField({ id: 'source', value: '', maxSizeBytes: 10 });
        const valid = new File([new Uint8Array([1, 2])], 'ok.pdf', { type: 'application/pdf' });
        const validInput = document.createElement('input');
        Object.defineProperty(validInput, 'files', { value: [valid] });
        component.onFileSelected({ target: validInput } as unknown as Event);

        expect(component.sizeErrorMaxSizeMB).toBeUndefined();
    });
});
