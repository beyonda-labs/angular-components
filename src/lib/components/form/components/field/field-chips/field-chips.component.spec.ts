import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, settle } from '@testing/dom';

import { FormChipsField } from '../../../models/fields/form-chips-field.model';
import { FormChipsFieldComponent } from './field-chips.component';

describe('FormChipsFieldComponent', () => {
    let fixture: ComponentFixture<FormChipsFieldComponent>;
    let control: FormControl<string[] | null>;

    async function render(field: FormChipsField = new FormChipsField({ key: 'tags' })): Promise<void> {
        control = new FormControl<string[] | null>([]);
        fixture = await renderComponent(FormChipsFieldComponent, { control, field, prefix: 'demo.person.tags' });
    }

    async function typeChip(value: string): Promise<void> {
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormChipsFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('adds a chip on Enter, ignoring blanks and duplicates, and removes it from its button', async () => {
        await render();

        await typeChip('angular');
        await typeChip('  ');
        await typeChip('angular');
        expect(control.value).toEqual(['angular']);

        (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
        expect(control.value).toEqual([]);
    });

    it('accepts duplicates and stops at the limit when the field says so', async () => {
        await render(new FormChipsField({ key: 'tags', allowDuplicates: true, maxItems: 2 }));

        await typeChip('a');
        await typeChip('a');
        await typeChip('b');

        expect(control.value).toEqual(['a', 'a']);
    });
});
