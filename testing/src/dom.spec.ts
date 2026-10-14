import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
    accessibleDescription,
    buttonByName,
    cellsOf,
    controlByName,
    hostOf,
    queryAll,
    queryButton,
    queryControl,
    renderComponent,
    rowWith,
    textsOf,
    visibleText
} from './dom';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-dom-probe',
    template: `
        <ul>
            @for (item of items(); track item) {
                <li>{{ item }}</li>
            }
        </ul>
        <p>
            <strong>Ada</strong>
            <em>Lovelace</em>
        </p>
        <button type="button">Save</button>
        <button aria-label="Close" type="button">x</button>
        <span role="button">Toggle</span>
        <label for="probe-title">Title</label>
        <input id="probe-title" aria-describedby="probe-title-hint" type="text" />
        <span id="probe-title-hint">Shown on the cover</span>
        <label>
            Size
            <select>
                <option>Small</option>
                <option>Large</option>
            </select>
        </label>
        <input aria-label="Search" type="search" />
        <span id="probe-widths">Column widths</span>
        <div aria-labelledby="probe-widths" role="group"></div>
        <div role="table">
            <div role="row">
                <span role="cell">Ada</span>
                <span role="cell">Admin</span>
            </div>
            <div role="row">
                <span role="cell">Linus</span>
                <span role="cell">Editor</span>
            </div>
        </div>
    `
})
class DomProbeComponent {
    readonly items = input<string[]>([]);
}

describe('testing/dom', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [DomProbeComponent] }).compileComponents();
    });

    it('renders a component with its inputs set', async () => {
        const fixture = await renderComponent(DomProbeComponent, { items: ['Ada', 'Linus'] });

        expect(textsOf(queryAll(fixture, 'li'))).toEqual(['Ada', 'Linus']);
    });

    it('finds a button by its visible text or its aria-label', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(buttonByName(fixture, 'Save').textContent?.trim()).toBe('Save');
        expect(buttonByName(fixture, 'Close').textContent?.trim()).toBe('x');
        expect(buttonByName(fixture, 'Toggle').getAttribute('role')).toBe('button');
    });

    it('reports a missing button as null, or throws when one is required', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(queryButton(fixture, 'Delete')).toBeNull();
        expect(() => buttonByName(fixture, 'Delete')).toThrow('No button named Delete');
    });

    it('queries inside an element as well as inside a fixture', async () => {
        const fixture = await renderComponent(DomProbeComponent, { items: ['Ada'] });
        const list = hostOf(fixture).querySelector('ul') as HTMLElement;

        expect(textsOf(queryAll(list, 'li'))).toEqual(['Ada']);
        expect(queryButton(list, 'Save')).toBeNull();
    });

    it('finds a control by its label, its aria-label or the element it is labelled by', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(controlByName(fixture, 'Title').id).toBe('probe-title');
        expect(controlByName<HTMLSelectElement>(fixture, 'Size').tagName).toBe('SELECT');
        expect(controlByName(fixture, 'Search').type).toBe('search');
        expect(controlByName(fixture, 'Column widths').getAttribute('role')).toBe('group');
    });

    it('reads the description of a control from the elements it is described by, or none', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(accessibleDescription(controlByName(fixture, 'Title'))).toBe('Shown on the cover');
        expect(accessibleDescription(controlByName(fixture, 'Search'))).toBe('');
    });

    it('reports a missing control as null, or throws when one is required', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(queryControl(fixture, 'Notes')).toBeNull();
        expect(() => controlByName(fixture, 'Notes')).toThrow('No control named Notes');
    });

    it('reads the text of an element as a reader sees it, one space between the texts of its nodes', async () => {
        const fixture = await renderComponent(DomProbeComponent, { items: ['Draft', 'Final'] });

        expect(visibleText(queryAll(fixture, 'p')[0])).toBe('Ada Lovelace');
        expect(visibleText(queryAll(fixture, 'ul')[0])).toBe('Draft Final');
    });

    it('finds the row holding a text and reads the texts of its cells', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(rowWith(fixture, 'Linus').textContent).toContain('Editor');
        expect(cellsOf(fixture, 'Ada')).toEqual(['Ada', 'Admin']);
    });

    it('throws when no row holds the text', async () => {
        const fixture = await renderComponent(DomProbeComponent);

        expect(() => rowWith(fixture, 'Grace')).toThrow('No row with Grace');
    });
});
