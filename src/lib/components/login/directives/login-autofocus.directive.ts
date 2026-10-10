import { DOCUMENT } from '@angular/common';
import { afterNextRender, Directive, ElementRef, inject } from '@angular/core';

const FOCUSABLE = 'input:not([disabled]), button:not([disabled]), a[href]';

@Directive({
    selector: '[beyLoginAutofocus]',
    standalone: true
})
export class LoginAutofocusDirective {
    private readonly document = inject(DOCUMENT);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    constructor() {
        afterNextRender(() => this.focusFirst());
    }

    private focusFirst(): void {
        const active = this.document.activeElement;

        if (active && active !== this.document.body) {
            return;
        }

        this.host.nativeElement.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }
}
