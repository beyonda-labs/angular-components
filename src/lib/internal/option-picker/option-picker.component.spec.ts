import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, textsOf } from '@testing/dom';

import { OptionPickerOption } from './models/option-picker-option.model';
import { OptionPickerComponent } from './option-picker.component';

const OPTIONS: OptionPickerOption[] = [
    { depth: 0, label: 'Customer', value: 'customer' },
    { depth: 1, label: 'Name', value: 'customer.name' },
    { depth: 0, isDisabled: true, label: 'Invoice', value: 'invoice' }
];

describe('OptionPickerComponent', () => {
    let component: OptionPickerComponent;
    let fixture: ComponentFixture<OptionPickerComponent>;
    let element: HTMLElement;

    function rows(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(element, '[role="option"]');
    }

    function searchInput(): HTMLInputElement {
        return element.querySelector<HTMLInputElement>('[aria-label="angular-components.option-picker.search"]')!;
    }

    function search(term: string): void {
        const input = searchInput();

        input.value = term;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }

    function press(key: string): void {
        searchInput().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
        fixture.detectChanges();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OptionPickerComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(OptionPickerComponent, {
            anchor: document.createElement('div'),
            options: OPTIONS
        });
        component = fixture.componentInstance;
        element = fixture.nativeElement;
    });

    afterEach(() => {
        element.remove();
    });

    it('lists every option without a search term', () => {
        expect(textsOf(rows())).toEqual(['Customer', 'Name', 'Invoice']);
    });

    it('filters the options by value or label', () => {
        search('name');

        expect(textsOf(rows())).toEqual(['Name']);
    });

    it('shows an empty state when nothing matches', () => {
        search('unknown');

        expect(element.textContent).toContain('angular-components.option-picker.empty');
    });

    it('hides the search box when it is not searchable', () => {
        fixture.componentRef.setInput('searchable', false);
        fixture.detectChanges();

        expect(element.querySelector('[aria-label="angular-components.option-picker.search"]')).toBeNull();
    });

    it('emits the clicked option and ignores disabled ones', () => {
        const selected = jest.fn();

        component.selected.subscribe(selected);
        rows()[2].click();
        rows()[1].click();

        expect(selected).toHaveBeenCalledTimes(1);
        expect(selected).toHaveBeenCalledWith(OPTIONS[1]);
    });

    it('moves the active row with the arrow keys and selects it with Enter', () => {
        const selected = jest.fn();

        component.selected.subscribe(selected);
        press('ArrowDown');

        expect(rows()[1].getAttribute('aria-selected')).toBe('true');

        press('Enter');

        expect(selected).toHaveBeenCalledWith(OPTIONS[1]);
    });

    it('emits closed on Escape and on a click outside the picker and its anchor', () => {
        const closed = jest.fn();

        component.closed.subscribe(closed);
        press('Escape');
        document.body.click();

        expect(closed).toHaveBeenCalledTimes(2);
    });
});
