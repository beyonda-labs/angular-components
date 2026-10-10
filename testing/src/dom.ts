import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export type QueryScope = ComponentFixture<unknown> | Element;

const CONTROL_SELECTOR = [
    'input',
    'select',
    'textarea',
    '[role="combobox"]',
    '[role="group"]',
    '[role="listbox"]',
    '[role="radiogroup"]',
    '[role="switch"]',
    '[role="textbox"]'
].join(', ');
const LABELLED_CONTROLS = 'input, select, textarea';

export function accessibleDescription(element: HTMLElement): string {
    return textOfReferences(element.getAttribute('aria-describedby') ?? '');
}

export function accessibleName(element: HTMLElement): string {
    const labelledBy = element.getAttribute('aria-labelledby');

    if (labelledBy) {
        return textOfReferences(labelledBy);
    }

    const labels =
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
            ? [...(element.labels ?? [])]
            : [];

    return (
        element.getAttribute('aria-label') ??
        labels
            .map(label => labelTextOf(label))
            .filter(Boolean)
            .join(' ')
    );
}

export function buttonByName(scope: QueryScope, name: string): HTMLButtonElement {
    const found = queryButton(scope, name);

    if (!found) {
        throw new Error(`No button named ${name}`);
    }

    return found;
}

export function controlByName<E extends HTMLElement = HTMLInputElement>(scope: QueryScope, name: string): E {
    const found = queryControl<E>(scope, name);

    if (!found) {
        throw new Error(`No control named ${name}`);
    }

    return found;
}

export function hostOf(scope: QueryScope): HTMLElement {
    return (scope instanceof Element ? scope : scope.nativeElement) as HTMLElement;
}

export function queryAll<E extends Element = HTMLElement>(scope: QueryScope, selector: string): E[] {
    return [...hostOf(scope).querySelectorAll<E>(selector)];
}

export function queryButton(scope: QueryScope, name: string): HTMLButtonElement | null {
    return (
        queryAll<HTMLButtonElement>(scope, 'button, [role="button"]').find(
            button => button.getAttribute('aria-label') === name || button.textContent?.trim() === name
        ) ?? null
    );
}

export function queryControl<E extends HTMLElement = HTMLInputElement>(scope: QueryScope, name: string): E | null {
    return queryAll<E>(scope, CONTROL_SELECTOR).find(control => accessibleName(control) === name) ?? null;
}

export async function renderComponent<T>(
    component: Type<T>,
    inputs: Record<string, unknown> = {}
): Promise<ComponentFixture<T>> {
    const fixture = TestBed.createComponent(component);

    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }

    await settle(fixture);

    return fixture;
}

export async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
}

export function textsOf(elements: Element[]): string[] {
    return elements.map(element => element.textContent?.trim() ?? '');
}

function labelTextOf(label: HTMLLabelElement): string {
    const copy = label.cloneNode(true) as HTMLLabelElement;

    for (const control of copy.querySelectorAll(LABELLED_CONTROLS)) {
        control.remove();
    }

    return copy.textContent?.trim() ?? '';
}

function textOfReferences(ids: string): string {
    return ids
        .split(' ')
        .filter(Boolean)
        .map(id => document.querySelector(`[id="${id}"]`)?.textContent?.trim() ?? '')
        .join(' ');
}
