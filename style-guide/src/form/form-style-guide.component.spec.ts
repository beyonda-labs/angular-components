import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeyFormNoticeField, BeyNoticeVariant } from '@beyonda-labs/angular-components';
import {
    accessibleDescription,
    accessibleName,
    buttonByName,
    controlByName,
    queryAll,
    queryButton,
    queryControl,
    renderComponent,
    settle,
    textsOf
} from '@testing/dom';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { FormStyleGuideComponent } from './form-style-guide.component';

const PREFIX = 'angular-components-style-guide.form';
const TEXTS = {
    'angular-components': { form: { 'list-field': { remove: 'Remove {{label}}' } } },
    'angular-components-style-guide': {
        form: { 'section-notice': { notice1: { message: 'This form holds {{count}} sections.' } } }
    }
};

describe('FormStyleGuideComponent', () => {
    let fixture: ComponentFixture<FormStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormStyleGuideComponent],
            providers: [provideBeyTesting({ translations: { en: TEXTS } })]
        }).compileComponents();

        fixture = await renderComponent(FormStyleGuideComponent);
    });

    function listNamed(name: string): HTMLElement {
        const list = queryAll(fixture, 'ul').find(candidate => candidate.getAttribute('aria-label') === name);

        if (!list) {
            throw new Error(`No list named ${name}`);
        }

        return list;
    }

    it('shows the form example and the button that opens the modal form', () => {
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.example`);
        expect(queryButton(fixture, `${PREFIX}.modal.open`)).not.toBeNull();
    });

    it('shows a hint under a field and a note next to the buttons, which describes the submit button', () => {
        expect(accessibleDescription(controlByName(fixture, `${PREFIX}.section-password.password1.label`))).toBe(
            `${PREFIX}.section-password.password1.hint`
        );
        expect(accessibleDescription(buttonByName(fixture, `${PREFIX}.button.submit`))).toBe(`${PREFIX}.footer.note`);
    });

    it('shows the checkbox sections twice, the read-only one with every box disabled', async () => {
        const editable = controlByName(fixture, `${PREFIX}.section-checkbox-sections.sections1.label`);
        const readOnly = controlByName(fixture, `${PREFIX}.section-checkbox-sections.sections2.label`);

        for (const group of [editable, readOnly]) {
            (group.querySelector('button[aria-expanded]') as HTMLButtonElement).click();
        }

        await fixture.whenStable();
        fixture.detectChanges();

        expect(editable.getAttribute('aria-required')).toBe('true');
        expect(editable.querySelector('input')?.disabled).toBe(false);
        expect(readOnly.querySelector('input')?.disabled).toBe(true);
    });

    it('shows a picked list fed by a search with a remove button per row, and its read-only copy without them', () => {
        const people = listNamed(`${PREFIX}.section-picked-list.people.label`);
        const readOnly = listNamed(`${PREFIX}.section-picked-list.read-only-people.label`);

        expect(controlByName(fixture, `${PREFIX}.section-picked-list.people.label`).getAttribute('role')).toBe(
            'combobox'
        );
        expect(textsOf(queryAll(people, 'li'))).toEqual([
            'Nora Lectora (nora@empresa.com)',
            'Íñigo Ruiz (inigo@empresa.com)'
        ]);
        expect(queryAll(people, 'button').map(button => accessibleName(button))).toEqual([
            'Remove Nora Lectora (nora@empresa.com)',
            'Remove Íñigo Ruiz (inigo@empresa.com)'
        ]);
        expect(textsOf(queryAll(readOnly, 'li'))).toEqual([
            'Nora Lectora (nora@empresa.com)',
            'Ada Lovelace (ada@empresa.com)',
            'Grace Hopper (grace@empresa.com)',
            'Alan Turing (alan@empresa.com)',
            'Margaret Hamilton (margaret@empresa.com)',
            'Katherine Johnson (katherine@empresa.com)',
            'Edsger Dijkstra (edsger@empresa.com)',
            'Barbara Liskov (barbara@empresa.com)',
            'Donald Knuth (donald@empresa.com)',
            'Frances Allen (frances@empresa.com)',
            'Linus Torvalds (linus@empresa.com)'
        ]);
        expect(queryAll(readOnly, 'button')).toEqual([]);
        expect(queryControl(fixture, `${PREFIX}.section-picked-list.read-only-people.label`)).toBeNull();
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.section-picked-list.roles.empty`);
    });

    it('says there are more people than the search of the picked list shows', async () => {
        controlByName(fixture, `${PREFIX}.section-picked-list.people.label`).dispatchEvent(new Event('focus'));
        await settle(fixture);

        expect(document.body.querySelector('[role="listbox"]')?.textContent).toContain(
            'angular-components.form.autocomplete-field.more'
        );
    });

    it('shows an info and a warning notice across their rows, the first with its parameters', () => {
        expect(fixture.nativeElement.textContent).toContain('This form holds 12 sections.');
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.section-notice.notice2.message`);
    });

    it('opens a deletion confirmation whose submit button is a danger, explained by a danger notice', async () => {
        buttonByName(fixture, `${PREFIX}.danger-modal.open`).click();

        const [config] = TestBed.inject(FakeModalFormService).forms();
        const [notice] = config.sections[0].rows[0].fields;
        const handle = new FakeFormHandle();

        expect(config.isSubmitDanger).toBe(true);
        expect(notice).toBeInstanceOf(BeyFormNoticeField);
        expect((notice as BeyFormNoticeField).variant).toBe(BeyNoticeVariant.Danger);

        config.onSubmit?.({}, handle);
        await settle(fixture);

        expect(handle.closes()).toBe(1);
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.danger-modal.submitted`);
    });

    it('suggests what the server search answers, less the city it leaves out', async () => {
        controlByName(fixture, `${PREFIX}.section-autocomplete-options.server.label`).dispatchEvent(new Event('focus'));
        await settle(fixture);

        expect(textsOf(queryAll(document.body, '[role="listbox"] [role="option"]'))).toEqual([
            'Barcelona',
            'Bilbao',
            'Málaga',
            'Sevilla',
            'Valencia'
        ]);
    });

    it('reports a pick of the field that only picks, which empties itself', async () => {
        const picker = controlByName(fixture, `${PREFIX}.section-autocomplete-options.picker.label`);

        picker.dispatchEvent(new Event('focus'));
        await settle(fixture);
        queryAll(document.body, '[role="listbox"] [role="option"]')[1].dispatchEvent(new MouseEvent('mousedown'));
        await settle(fixture);

        expect(picker.value).toBe('');
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.section-autocomplete-options.picked`);
    });

    it('suggests nothing in the typeahead until a city is typed, and keeps only a picked one', async () => {
        const typeahead = controlByName(fixture, `${PREFIX}.section-autocomplete-options.typeahead.label`);

        typeahead.dispatchEvent(new Event('focus'));
        await settle(fixture);

        expect(document.body.querySelector('[role="listbox"]')).toBeNull();

        typeahead.value = 'bil';
        typeahead.dispatchEvent(new Event('input'));
        await settle(fixture);
        queryAll(document.body, '[role="listbox"] [role="option"]')[0].dispatchEvent(new MouseEvent('mousedown'));
        await settle(fixture);

        expect(typeahead.value).toBe('Bilbao');

        typeahead.value = 'Bilbaoo';
        typeahead.dispatchEvent(new Event('input'));
        typeahead.dispatchEvent(new Event('blur'));
        await settle(fixture);

        expect(typeahead.value).toBe('');
        expect(typeahead.getAttribute('aria-invalid')).toBe('true');
    });

    it('lists every rule of a password policy under the field that has one', () => {
        const description = accessibleDescription(controlByName(fixture, `${PREFIX}.section-password.password5.label`));

        for (const rule of ['length', 'uppercase', 'lowercase', 'digit', 'symbol']) {
            expect(description).toContain(`angular-components.form.password-field.policy.${rule}`);
        }
    });
});
