import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormPasswordFieldComponent } from './field-password.component';

describe('FormPasswordFieldComponent', () => {
    let fixture: ComponentFixture<FormPasswordFieldComponent>;

    async function render(field: FormPasswordField = new FormPasswordField({ key: 'password' })): Promise<void> {
        fixture = await renderComponent(FormPasswordFieldComponent, {
            control: new FormControl(''),
            field,
            prefix: 'demo.login.password'
        });
    }

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormPasswordFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('hides the password until the toggle reveals it', async () => {
        await render();
        expect(input().type).toBe('password');

        (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(input().type).toBe('text');
    });

    it('offers no toggle when the field opts out', async () => {
        await render(new FormPasswordField({ key: 'password', showToggle: false }));

        expect(fixture.nativeElement.querySelector('button')).toBeNull();
    });

    it('gives the browser the autofill hint of the field', async () => {
        await render(new FormPasswordField({ autocomplete: 'new-password', key: 'password' }));

        expect(input().getAttribute('autocomplete')).toBe('new-password');
    });
});
