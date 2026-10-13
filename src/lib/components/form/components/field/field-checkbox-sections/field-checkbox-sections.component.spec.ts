import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    accessibleDescription,
    buttonByName,
    controlByName,
    queryAll,
    queryButton,
    renderComponent,
    settle
} from '@testing/dom';

import formEn from '../../../assets/form.en.json';
import {
    FormCheckboxSection,
    FormCheckboxSectionsField
} from '../../../models/fields/form-checkbox-sections-field.model';
import { FormCheckboxSectionsFieldComponent } from './field-checkbox-sections.component';

const SECTIONS: FormCheckboxSection[] = [
    {
        icon: faFileLines,
        key: 'templates',
        label: 'Templates',
        options: [
            { description: 'Can see the templates.', label: 'See', value: 'templates.read' },
            { label: 'Edit', value: 'templates.edit' },
            { isDisabled: true, label: 'Publish', value: 'templates.publish' }
        ]
    },
    {
        key: 'documents',
        label: 'Documents',
        options: [
            { label: 'Read', value: 'documents.read' },
            { label: 'Delete', value: 'documents.delete' }
        ]
    }
];

describe('FormCheckboxSectionsFieldComponent', () => {
    let fixture: ComponentFixture<FormCheckboxSectionsFieldComponent>;
    let control: FormControl<string[] | null>;

    async function render(value: string[] = [], sections: FormCheckboxSection[] = SECTIONS): Promise<void> {
        control = new FormControl<string[] | null>(value, Validators.required);
        fixture = await renderComponent(FormCheckboxSectionsFieldComponent, {
            control,
            field: new FormCheckboxSectionsField({ key: 'permissions', sections }),
            isRequired: true,
            label: 'Permissions'
        });
    }

    function header(title: string): HTMLButtonElement {
        const found = queryAll<HTMLButtonElement>(fixture, 'button[aria-expanded]').find(button =>
            button.textContent?.includes(title)
        );

        if (!found) {
            throw new Error(`No section named ${title}`);
        }

        return found;
    }

    function checkbox(name: string): HTMLInputElement {
        return controlByName(fixture, name);
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormCheckboxSectionsFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', formEn);
        translate.use('en');
    });

    it('shows a section per entry with its counter, every one folded at first, also those with something checked', async () => {
        await render(['documents.read']);

        expect(controlByName(fixture, 'Permissions').getAttribute('role')).toBe('group');
        expect(header('Templates').getAttribute('aria-expanded')).toBe('false');
        expect(header('Templates').textContent).toContain('0 of 3 checked');
        expect(header('Documents').getAttribute('aria-expanded')).toBe('false');
        expect(header('Documents').textContent).toContain('1/2');

        await click(header('Documents'));

        expect(checkbox('Read').checked).toBe(true);
        expect(checkbox('Delete').checked).toBe(false);
        expect(fixture.nativeElement.textContent).not.toContain('See');
    });

    it('unfolds a section from its header and folds it again', async () => {
        await render();

        await click(header('Templates'));

        expect(header('Templates').getAttribute('aria-expanded')).toBe('true');
        expect(accessibleDescription(checkbox('See'))).toBe('Can see the templates.');
        expect(accessibleDescription(checkbox('Edit'))).toBe('');
        expect(checkbox('Publish').disabled).toBe(true);

        await click(header('Templates'));

        expect(header('Templates').getAttribute('aria-expanded')).toBe('false');
        expect(fixture.nativeElement.textContent).not.toContain('Publish');
    });

    it('adds a checked option to the value, in the order of the sections, and removes it once unchecked', async () => {
        await render(['documents.delete']);

        await click(header('Templates'));
        await click(checkbox('Edit'));

        expect(control.value).toEqual(['templates.edit', 'documents.delete']);
        expect(control.dirty).toBe(true);
        expect(header('Templates').textContent).toContain('1/3');

        await click(checkbox('Edit'));

        expect(control.value).toEqual(['documents.delete']);
    });

    it('checks every enabled option of a section at once, and then offers to clear them', async () => {
        await render(['documents.read']);

        await click(buttonByName(fixture, 'Select all in Templates'));

        expect(control.value).toEqual(['templates.read', 'templates.edit', 'documents.read']);

        await click(buttonByName(fixture, 'Select all in Documents'));
        await click(buttonByName(fixture, 'Clear all in Documents'));

        expect(control.value).toEqual(['templates.read', 'templates.edit']);
        expect(buttonByName(fixture, 'Clear all in Templates').textContent?.trim()).toBe('Clear all');
    });

    it('keeps a value no section offers', async () => {
        await render(['legacy.permission']);

        await click(buttonByName(fixture, 'Select all in Documents'));

        expect(control.value).toEqual(['documents.read', 'documents.delete', 'legacy.permission']);
    });

    it('flags the group once touched while nothing is checked', async () => {
        await render(['documents.read']);

        await click(header('Documents'));
        await click(checkbox('Read'));

        expect(controlByName(fixture, 'Permissions').getAttribute('aria-invalid')).toBe('true');
    });

    it('shows a disabled control read-only: every box disabled and nothing to select, though it still folds', async () => {
        await render(['documents.read']);

        control.disable();
        await settle(fixture);
        await click(header('Documents'));

        expect(checkbox('Read').disabled).toBe(true);
        expect(queryButton(fixture, 'Select all in Templates')).toBeNull();
        expect(queryButton(fixture, 'Select all in Documents')).toBeNull();

        await click(header('Documents'));

        expect(header('Documents').getAttribute('aria-expanded')).toBe('false');
    });
});
