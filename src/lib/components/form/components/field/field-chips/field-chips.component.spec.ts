import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormChipsField } from '../../../models/fields/form-chips-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormChipsFieldComponent } from './field-chips.component';

describe('FormChipsFieldComponent', () => {
    let component: FormChipsFieldComponent;
    let fixture: ComponentFixture<FormChipsFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl<string[]>([]));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormChipsFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormChipsFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormChipsField({ key: 'chips1' });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder should return translated key', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });

    it('addChip should append a trimmed value and clear the input', () => {
        component.inputValue = '  frontend  ';

        component.addChip();

        expect(component.control?.value).toEqual(['frontend']);
        expect(component.inputValue).toBe('');
    });

    it('addChip should not append an empty value', () => {
        component.inputValue = '   ';

        component.addChip();

        expect(component.control?.value).toEqual([]);
    });

    it('addChip should not append duplicates by default', () => {
        component.control?.setValue(['frontend']);
        component.inputValue = 'frontend';

        component.addChip();

        expect(component.control?.value).toEqual(['frontend']);
    });

    it('addChip should append duplicates when allowDuplicates is true', () => {
        component.field = new FormChipsField({ key: 'chips1', allowDuplicates: true });
        component.control?.setValue(['frontend']);
        component.inputValue = 'frontend';

        component.addChip();

        expect(component.control?.value).toEqual(['frontend', 'frontend']);
    });

    it('addChip should not append beyond maxItems', () => {
        component.field = new FormChipsField({ key: 'chips1', maxItems: 1 });
        component.control?.setValue(['frontend']);
        component.inputValue = 'backend';

        component.addChip();

        expect(component.control?.value).toEqual(['frontend']);
    });

    it('removeChip should remove the chip at the given index', () => {
        component.control?.setValue(['frontend', 'backend']);

        component.removeChip(0);

        expect(component.control?.value).toEqual(['backend']);
    });

    it('removeChip should do nothing when the field is disabled', () => {
        component.field.isDisabled = true;
        component.control?.setValue(['frontend']);

        component.removeChip(0);

        expect(component.control?.value).toEqual(['frontend']);
    });

    it('isMaxItemsReached should be false without maxItems', () => {
        expect(component.isMaxItemsReached()).toBe(false);
    });

    it('isMaxItemsReached should be true once the limit is reached', () => {
        component.field = new FormChipsField({ key: 'chips1', maxItems: 1 });
        component.control?.setValue(['frontend']);

        expect(component.isMaxItemsReached()).toBe(true);
    });

    it('onKeyDown with Enter should add the current chip and prevent default', () => {
        component.inputValue = 'frontend';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        jest.spyOn(event, 'preventDefault');

        component.onKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.control?.value).toEqual(['frontend']);
    });

    it('onKeyDown with Backspace on empty input should remove the last chip', () => {
        component.control?.setValue(['frontend', 'backend']);
        component.inputValue = '';
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });

        component.onKeyDown(event);

        expect(component.control?.value).toEqual(['frontend']);
    });

    it('onKeyDown with Backspace on a non-empty input should not remove chips', () => {
        component.control?.setValue(['frontend']);
        component.inputValue = 'back';
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });

        component.onKeyDown(event);

        expect(component.control?.value).toEqual(['frontend']);
    });

    it('isInvalid should reflect control state', () => {
        component.control?.markAsTouched();
        component.control?.setErrors({ maxItems: true });

        expect(component.isInvalid()).toBe(true);
    });
});
