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

    function search(term: string): void {
        const input = element.querySelector<HTMLInputElement>(
            '[aria-label="angular-components.option-picker.search"]'
        )!;

        input.value = term;
        input.dispatchEvent(new Event('input'));
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

    it('should list every option, indented by depth, without a search term', () => {
        expect(textsOf(rows())).toEqual(['Customer', 'Name', 'Invoice']);
        expect(rows()[1].style.getPropertyValue('--bey-option-picker-row-depth')).toBe('1');
    });

    it('should filter by value or label as a flat list', () => {
        search('name');

        expect(textsOf(rows())).toEqual(['Name']);
        expect(rows()[0].style.getPropertyValue('--bey-option-picker-row-depth')).toBe('0');
    });

    it('should show an empty state when nothing matches', () => {
        search('unknown');

        expect(element.textContent).toContain('angular-components.option-picker.empty');
    });

    it('should hide the search header when not searchable', () => {
        fixture.componentRef.setInput('searchable', false);
        fixture.detectChanges();

        expect(element.querySelector('[aria-label="angular-components.option-picker.search"]')).toBeNull();
    });

    it('should emit the clicked option and ignore disabled ones', () => {
        const selected = jest.fn();

        component.selected.subscribe(selected);
        rows()[2].click();
        rows()[1].click();

        expect(selected).toHaveBeenCalledTimes(1);
        expect(selected).toHaveBeenCalledWith(OPTIONS[1]);
    });

    it('should move the active row with the arrow keys and select it with Enter', () => {
        const selected = jest.fn();

        component.selected.subscribe(selected);
        component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        fixture.detectChanges();

        expect(rows()[1].getAttribute('aria-selected')).toBe('true');

        component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

        expect(selected).toHaveBeenCalledWith(OPTIONS[1]);
    });

    it('should emit closed on Escape and on a click outside the picker and its anchor', () => {
        const closed = jest.fn();

        component.closed.subscribe(closed);
        component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
        document.body.click();

        expect(closed).toHaveBeenCalledTimes(2);
    });
});
