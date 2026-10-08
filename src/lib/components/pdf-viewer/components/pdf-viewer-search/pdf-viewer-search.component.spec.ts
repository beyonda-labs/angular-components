import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { PdfViewerSearchMatches } from '../../models/pdf-viewer-value.model';
import { PdfViewerSearchComponent } from './pdf-viewer-search.component';

const CLOSE = 'angular-components.pdf-viewer.search.close';
const FIELD = 'angular-components.pdf-viewer.search.field';
const NEXT_MATCH = 'angular-components.pdf-viewer.search.next-match';
const NO_MATCHES = 'angular-components.pdf-viewer.search.no-matches';
const PREVIOUS_MATCH = 'angular-components.pdf-viewer.search.previous-match';

interface SearchInputs {
    matches?: PdfViewerSearchMatches;
    query?: string;
}

describe('PdfViewerSearchComponent', () => {
    let fixture: ComponentFixture<PdfViewerSearchComponent>;

    const dismiss = jest.fn();
    const next = jest.fn();
    const previous = jest.fn();
    const queryChange = jest.fn();

    async function render(inputs: SearchInputs = {}): Promise<void> {
        fixture = await renderComponent(PdfViewerSearchComponent, { ...inputs });
        fixture.componentInstance.dismiss.subscribe(dismiss);
        fixture.componentInstance.next.subscribe(next);
        fixture.componentInstance.previous.subscribe(previous);
        fixture.componentInstance.queryChange.subscribe(queryChange);
        await settle(fixture);
    }

    function field(): HTMLInputElement {
        return fixture.nativeElement.querySelector(`input[aria-label="${FIELD}"]`) as HTMLInputElement;
    }

    function text(): string {
        return fixture.nativeElement.textContent ?? '';
    }

    async function type(value: string): Promise<void> {
        field().value = value;
        field().dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    function press(target: HTMLElement, key: string, shiftKey = false): KeyboardEvent {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, shiftKey });

        target.dispatchEvent(event);

        return event;
    }

    beforeEach(async () => {
        jest.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [PdfViewerSearchComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('takes the focus as it opens, with the last query selected to type over it', async () => {
        await render({ query: 'total' });

        expect(document.activeElement).toBe(field());
        expect(field().value).toBe('total');
        expect([field().selectionStart, field().selectionEnd]).toEqual([0, 5]);
    });

    it('sends the query as it is typed, and moves to the next match with Enter and the previous one with Shift+Enter', async () => {
        await render({ matches: { current: 1, total: 4 } });

        await type('total');
        press(field(), 'Enter');
        press(field(), 'Enter', true);

        expect(queryChange).toHaveBeenCalledWith('total');
        expect(next).toHaveBeenCalledTimes(1);
        expect(previous).toHaveBeenCalledTimes(1);
    });

    it('counts the matches of the typed query, or says there are none, and moves between them with its arrows', async () => {
        await render({ matches: { current: 2, total: 7 } });

        expect(text()).not.toContain('2 / 7');

        await type('total');
        buttonByName(fixture, NEXT_MATCH).click();
        buttonByName(fixture, PREVIOUS_MATCH).click();

        expect(text()).toContain('2 / 7');
        expect(next).toHaveBeenCalledTimes(1);
        expect(previous).toHaveBeenCalledTimes(1);

        fixture.componentRef.setInput('matches', { current: 0, total: 0 });
        await settle(fixture);

        expect(text()).toContain(NO_MATCHES);
        expect(buttonByName(fixture, NEXT_MATCH).disabled).toBe(true);
        expect(buttonByName(fixture, PREVIOUS_MATCH).disabled).toBe(true);
    });

    it('closes with Escape from anywhere in it, keeping the key from the dialog around it, and with its close button', async () => {
        await render();

        const fromField = press(field(), 'Escape');
        const fromArrow = press(buttonByName(fixture, NEXT_MATCH), 'Escape');

        buttonByName(fixture, CLOSE).click();

        expect(dismiss).toHaveBeenCalledTimes(3);
        expect(fromField.defaultPrevented).toBe(true);
        expect(fromArrow.defaultPrevented).toBe(true);
    });
});
