import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { controlByName, renderComponent, settle } from '@testing/dom';

import { FormCheckboxGroupField } from '../../../models/fields/form-checkbox-group-field.model';
import { FormCheckboxGroupFieldComponent } from './field-checkbox-group.component';

describe('FormCheckboxGroupFieldComponent', () => {
    let fixture: ComponentFixture<FormCheckboxGroupFieldComponent>;
    let control: FormControl<string[] | null>;

    async function render(value: string[] = []): Promise<void> {
        control = new FormControl<string[] | null>(value);
        fixture = await renderComponent(FormCheckboxGroupFieldComponent, {
            control,
            field: new FormCheckboxGroupField({ key: 'roles' }),
            label: 'demo.user.roles.label',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { isDisabled: true, label: 'Owner', value: 'owner' }
            ],
            prefix: 'demo.user.roles'
        });
    }

    function checkbox(name: string): HTMLInputElement {
        return controlByName(fixture, name);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormCheckboxGroupFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('offers a labelled checkbox per option inside a named group, checked for the values it holds', async () => {
        await render(['editor']);

        expect(controlByName(fixture, 'demo.user.roles.label').getAttribute('role')).toBe('group');
        expect(checkbox('Admin').checked).toBe(false);
        expect(checkbox('Editor').checked).toBe(true);
        expect(checkbox('Owner').disabled).toBe(true);
    });

    it('adds the value of a checked option and removes it once unchecked', async () => {
        await render(['editor']);

        checkbox('Admin').click();
        await settle(fixture);
        expect(control.value).toEqual(['editor', 'admin']);
        expect(control.dirty).toBe(true);

        checkbox('Editor').click();
        await settle(fixture);
        expect(control.value).toEqual(['admin']);
    });

    it('disables every option while the control is disabled', async () => {
        await render();

        control.disable();
        await settle(fixture);

        expect(checkbox('Admin').disabled).toBe(true);
    });
});
