import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { controlByName, renderComponent } from '@testing/dom';

import { LoginAutofocusDirective } from './login-autofocus.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoginAutofocusDirective],
    standalone: true,
    template: `
        <div beyLoginAutofocus>
            <p>Intro</p>
            <input aria-label="Email" disabled />
            <input aria-label="Name" />
        </div>
    `
})
class AutofocusHostComponent {}

describe('LoginAutofocusDirective', () => {
    beforeEach(async () => {
        (document.activeElement as HTMLElement | null)?.blur();

        await TestBed.configureTestingModule({ imports: [AutofocusHostComponent] }).compileComponents();
    });

    it('focuses the first enabled field of its host once rendered', async () => {
        const fixture = await renderComponent(AutofocusHostComponent);

        expect(document.activeElement).toBe(controlByName(fixture, 'Name'));
    });

    it('leaves the focus where it is when another element already holds it', async () => {
        const outside = document.createElement('button');
        document.body.append(outside);
        outside.focus();

        await renderComponent(AutofocusHostComponent);

        expect(document.activeElement).toBe(outside);
        outside.remove();
    });
});
