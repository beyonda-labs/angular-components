import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

export type QueryScope = ComponentFixture<unknown> | Element;

export function buttonByName(scope: QueryScope, name: string): HTMLButtonElement {
    const found = queryButton(scope, name);

    if (!found) {
        throw new Error(`No button named ${name}`);
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
