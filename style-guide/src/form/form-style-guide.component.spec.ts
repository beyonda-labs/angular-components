import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    accessibleDescription,
    buttonByName,
    controlByName,
    queryAll,
    queryButton,
    queryControl,
    renderComponent,
    settle,
    textsOf
} from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormStyleGuideComponent } from './form-style-guide.component';

const PREFIX = 'angular-components-style-guide.form';

describe('FormStyleGuideComponent', () => {
    let fixture: ComponentFixture<FormStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormStyleGuideComponent],
            providers: [provideBeyTesting()]
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
        expect(queryAll(people, 'button')).toHaveLength(2);
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

    it('lists every rule of a password policy under the field that has one', () => {
        const description = accessibleDescription(controlByName(fixture, `${PREFIX}.section-password.password5.label`));

        for (const rule of ['length', 'uppercase', 'lowercase', 'digit', 'symbol']) {
            expect(description).toContain(`angular-components.form.password-field.policy.${rule}`);
        }
    });
});
