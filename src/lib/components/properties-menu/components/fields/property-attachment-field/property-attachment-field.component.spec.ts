import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import {
    PropertyAttachmentField,
    PropertyAttachmentOption
} from '../../../models/fields/property-attachment-field.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertiesMenuService } from '../../../services/properties-menu.service';
import { PropertyAttachmentFieldComponent } from './property-attachment-field.component';

const buildField = (value = ''): PropertyAttachmentField =>
    new PropertyAttachmentField({
        id: 'source',
        value,
        options: [
            new PropertyAttachmentOption({ id: 'a1', label: 'Logo A4' }),
            new PropertyAttachmentOption({ id: 'a2', label: 'Imagen migrado 1' })
        ]
    });

function selectFileOn(component: PropertyAttachmentFieldComponent, file: File): void {
    component.onFileSelected({ target: { files: [file], value: 'C:/fake/path' } } as unknown as Event);
}

describe('PropertyAttachmentFieldComponent', () => {
    let component: PropertyAttachmentFieldComponent;
    let fixture: ComponentFixture<PropertyAttachmentFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyAttachmentFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyAttachmentFieldComponent);
        component = fixture.componentInstance;
    });

    it('styles the upload trigger with the shared property button class', () => {
        fixture.componentRef.setInput('field', buildField());
        fixture.detectChanges();

        const upload = fixture.nativeElement.querySelector('.bey-property-attachment-field-upload');

        expect(upload.classList.contains('bey-property-field-action')).toBe(true);
    });

    it('styles the clear trigger with the shared property button class once a value is set', () => {
        fixture.componentRef.setInput('field', buildField('a1'));
        fixture.detectChanges();

        const triggers = fixture.nativeElement.querySelectorAll('.bey-property-field-action');

        expect(triggers.length).toBe(2);
    });

    it('does not render a clear trigger while no attachment is selected', () => {
        fixture.componentRef.setInput('field', buildField());
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-property-field-action').length).toBe(1);
    });

    it('filters the options by the typed query', () => {
        fixture.componentRef.setInput('field', buildField());
        component.query.set('migrado');

        expect(component.filteredOptions().map(option => option.id)).toEqual(['a2']);
    });

    it('emits the picked option and closes the panel', () => {
        fixture.componentRef.setInput('field', buildField());
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');
        component.onFocus();

        component.onOptionPicked(component.field().options[1], new MouseEvent('mousedown'));

        expect(emitSpy).toHaveBeenCalledWith('a2');
        expect(component.isOpen()).toBe(false);
    });
});

const VARIABLES = [new PropertyVariable({ id: 'v1', label: 'logo_cliente', path: 'logo_cliente' })];

describe('PropertyAttachmentFieldComponent · variables', () => {
    let component: PropertyAttachmentFieldComponent;
    let fixture: ComponentFixture<PropertyAttachmentFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyAttachmentFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyAttachmentFieldComponent);
        component = fixture.componentInstance;
    });

    it('offers no variable button when the field carries no variables', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyAttachmentField({
                id: 'source',
                value: '',
                options: [new PropertyAttachmentOption({ id: 'a1', label: 'Logo' })]
            })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-property-field-action').length).toBe(1);
    });

    it('offers a variable button when the field carries variables', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyAttachmentField({ id: 'source', value: '', variables: VARIABLES })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-property-field-action').length).toBe(2);
    });

    it('emits the reference expression when a variable is picked', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyAttachmentField({ id: 'source', value: '', variables: VARIABLES })
        );
        fixture.detectChanges();

        const emitSpy = jest.spyOn(component.valueChange, 'emit');

        component.onVariableSelected(component.variableOptions()[0]);

        expect(emitSpy).toHaveBeenCalledWith('{{ logo_cliente }}');
        expect(component.pickerOpen()).toBe(false);
    });

    it('closes the attachment list when the variable picker opens', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyAttachmentField({ id: 'source', value: '', variables: VARIABLES })
        );
        fixture.detectChanges();

        component.onFocus();
        component.toggleVariablePicker();

        expect(component.pickerOpen()).toBe(true);
        expect(component.isOpen()).toBe(false);
    });

    it('tells apart a value holding a variable from a plain attachment id', () => {
        const withVariable = new PropertyAttachmentField({ id: 'source', value: '{{ logo_cliente }}' });
        const withId = new PropertyAttachmentField({ id: 'source', value: 'a1' });

        expect(withVariable.holdsVariable).toBe(true);
        expect(withId.holdsVariable).toBe(false);
    });

    describe('picking a file to upload', () => {
        beforeEach(() => {
            fixture.componentRef.setInput(
                'field',
                new PropertyAttachmentField({
                    id: 'source',
                    accept: 'image/*,application/pdf',
                    maxSizeBytes: 1000
                })
            );
            fixture.detectChanges();
        });

        it('uploads a file of an accepted type', () => {
            const uploads: File[] = [];

            component.uploadRequested.subscribe(file => uploads.push(file));
            selectFileOn(component, new File(['x'], 'logo.png', { type: 'image/png' }));

            expect(uploads.length).toBe(1);
            expect(component.hasTypeError()).toBe(false);
        });

        it('rejects a file whose type is not accepted, without uploading it', () => {
            const onUpload = jest.fn();

            component.uploadRequested.subscribe(onUpload);
            selectFileOn(component, new File(['x'], 'notes.txt', { type: 'text/plain' }));

            expect(onUpload).not.toHaveBeenCalled();
            expect(component.hasTypeError()).toBe(true);
        });

        it('clears the type error once an accepted file is picked', () => {
            selectFileOn(component, new File(['x'], 'notes.txt', { type: 'text/plain' }));
            selectFileOn(component, new File(['x'], 'logo.png', { type: 'image/png' }));

            expect(component.hasTypeError()).toBe(false);
        });

        it('still rejects a file over the size limit', () => {
            const onUpload = jest.fn();
            const big = new File([new Uint8Array(2000)], 'big.png', { type: 'image/png' });

            component.uploadRequested.subscribe(onUpload);
            selectFileOn(component, big);

            expect(onUpload).not.toHaveBeenCalled();
            expect(component.sizeErrorMaxSizeMB()).not.toBeNull();
        });
    });

    it('no longer renders any preview image', () => {
        fixture.componentRef.setInput(
            'field',
            new PropertyAttachmentField({
                id: 'source',
                value: 'a1',
                options: [new PropertyAttachmentOption({ id: 'a1', label: 'Logo' })]
            })
        );
        fixture.detectChanges();
        component.onFocus();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('img').length).toBe(0);
    });
});
