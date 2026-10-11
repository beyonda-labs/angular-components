import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';
import { of } from 'rxjs';

import formEn from '../../../assets/form.en.json';
import { FormListField, FormListFieldParameters } from '../../../models/fields/form-list-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { FormListFieldComponent } from './field-list.component';

const ADA: FormFieldOption = { label: 'Ada Lovelace (ada@empresa.com)', value: 'u1' };
const NORA: FormFieldOption = { label: 'Nora Lectora (nora@empresa.com)', value: 'u2' };
const PEOPLE = [ADA, NORA];
const LABEL = 'Members';

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

    describe('holding a value', () => {
        let control: FormControl<string[] | null>;
        let fixture: ComponentFixture<FormListFieldComponent>;

        async function renderValue(
            overrides: Partial<FormListFieldParameters> = {},
            value = ['u1'],
            options = [ADA]
        ): Promise<void> {
            control = new FormControl<string[] | null>(value);
            fixture = await renderComponent(FormListFieldComponent, {
                control,
                field: new FormListField({
                    emptyKey: 'demo.group.members.empty',
                    isRemovable: true,
                    key: 'userIds',
                    options,
                    picker: {},
                    ...overrides
                }),
                label: LABEL,
                options,
                prefix: 'demo.group.user-ids'
            });
        }

        function rows(): string[] {
            return textsOf(queryAll(fixture, 'li'));
        }

        function search(): HTMLInputElement | null {
            return (fixture.nativeElement as HTMLElement).querySelector('[role="combobox"]');
        }

        async function type(text: string): Promise<void> {
            const input = search() as HTMLInputElement;

            input.dispatchEvent(new Event('focus'));
            input.value = text;
            input.dispatchEvent(new Event('input'));
            await settle(fixture);
        }

        function suggestions(): HTMLButtonElement[] {
            return queryAll<HTMLButtonElement>(document.body, '[role="option"]');
        }

        beforeEach(() => {
            const translate = TestBed.inject(TranslateService);

            translate.setTranslation('en', formEn);
            translate.use('en');
        });

        afterEach(() => {
            fixture.destroy();
        });

        it('shows a row per id with the label of its option, or the id when no option names it', async () => {
            await renderValue({}, ['u1', 'u9']);

            expect(queryAll(fixture, 'ul')[0].getAttribute('aria-label')).toBe(LABEL);
            expect(rows()).toEqual(['Ada Lovelace (ada@empresa.com)', 'u9']);
        });

        it('takes a row away with its remove button, changing the value', async () => {
            await renderValue({}, ['u1', 'u9']);

            buttonByName(fixture, 'Remove Ada Lovelace (ada@empresa.com)').click();
            await settle(fixture);

            expect(control.value).toEqual(['u9']);
            expect(control.dirty).toBe(true);
            expect(rows()).toEqual(['u9']);
        });

        it('shows its empty text while it holds no id', async () => {
            await renderValue({}, []);

            expect((fixture.nativeElement as HTMLElement).textContent).toContain('demo.group.members.empty');
        });

        it('adds what is picked from its search as a row, clears the search and offers only what it lacks', async () => {
            const onSelect = jest.fn();
            await renderValue({ picker: { onSelect } }, ['u1'], PEOPLE);

            await type('empresa');

            expect(textsOf(suggestions())).toEqual(['Nora Lectora (nora@empresa.com)']);

            suggestions()[0].dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);

            expect(control.value).toEqual(['u1', 'u2']);
            expect(control.dirty).toBe(true);
            expect(onSelect).toHaveBeenCalledWith(NORA);
            expect(search()?.value).toBe('');
            expect(rows()).toEqual(['Ada Lovelace (ada@empresa.com)', 'Nora Lectora (nora@empresa.com)']);
        });

        it('names a row picked from the server search with the label the search gave it', async () => {
            const searchPeople = jest.fn(() => of(PEOPLE));
            await renderValue({ picker: { search: searchPeople } });

            await type('nora');
            suggestions()[0].dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);

            expect(searchPeople).toHaveBeenLastCalledWith('nora', ['u1']);
            expect(rows()).toEqual(['Ada Lovelace (ada@empresa.com)', 'Nora Lectora (nora@empresa.com)']);
        });

        it('shows its rows without remove buttons and without the search while disabled', async () => {
            await renderValue();

            control.disable();
            await settle(fixture);

            expect(rows()).toEqual(['Ada Lovelace (ada@empresa.com)']);
            expect(queryButton(fixture, 'Remove Ada Lovelace (ada@empresa.com)')).toBeNull();
            expect(search()).toBeNull();
        });

        it('offers no remove button unless the field is removable', async () => {
            await renderValue({ isRemovable: false });

            expect(queryButton(fixture, 'Remove Ada Lovelace (ada@empresa.com)')).toBeNull();
            expect(search()).not.toBeNull();
        });
    });
});
