import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, settle, textsOf } from '@testing/dom';

import { FormListField } from '../../../models/fields/form-list-field.model';
import { FormListFieldComponent } from './field-list.component';

describe('FormListFieldComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormListFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    function render(field: FormListField) {
        return renderComponent(FormListFieldComponent, {
            field,
            label: 'demo.files.used-by.label',
            prefix: 'demo.files.used-by'
        });
    }

    it('lists every item in a list named by the field label', async () => {
        const fixture = await render(new FormListField({ key: 'usedBy', items: ['Invoice', 'Offer'] }));
        const list = (fixture.nativeElement as HTMLElement).querySelector('[role="list"], ul') as HTMLElement;

        expect(list.getAttribute('aria-label')).toBe('demo.files.used-by.label');
        expect(textsOf([...list.querySelectorAll('li')])).toEqual(['Invoice', 'Offer']);
    });

    it('shows its placeholder while it has no items, and the items once a signal brings them', async () => {
        const items = signal<string[]>([]);
        const fixture = await render(new FormListField({ key: 'usedBy', items }));
        const element = fixture.nativeElement as HTMLElement;

        expect(element.textContent?.trim()).toBe('demo.files.used-by.placeholder');

        items.set(['Invoice']);
        await settle(fixture);

        expect(textsOf([...element.querySelectorAll('li')])).toEqual(['Invoice']);
    });
});
