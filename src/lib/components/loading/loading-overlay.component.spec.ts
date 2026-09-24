import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingOverlayComponent } from './loading-overlay.component';
import { LoadingSize } from './models/loading.model';

describe('LoadingOverlayComponent', () => {
    let fixture: ComponentFixture<LoadingOverlayComponent>;

    async function render(inputs: Record<string, unknown> = {}): Promise<void> {
        fixture = TestBed.createComponent(LoadingOverlayComponent);
        Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function overlay(): HTMLElement {
        return fixture.nativeElement.querySelector('[role="alert"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingOverlayComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('marks the area it covers as busy', async () => {
        await render();

        expect(overlay().getAttribute('aria-busy')).toBe('true');
    });

    /* Covering the container or the screen is expressed only in CSS, so the class is the contract here. */
    it('switches to the fullscreen variant when asked to', async () => {
        await render();
        expect(overlay().classList).not.toContain('is-fullscreen');

        await render({ fullscreen: true });
        expect(overlay().classList).toContain('is-fullscreen');
    });

    it('spins large by default', async () => {
        await render();

        expect(
            fixture.nativeElement.querySelector('[role="status"]').style.getPropertyValue('--bey-loading-size')
        ).toBe('4rem');
    });

    it('passes a given size down to the spinner', async () => {
        await render({ size: LoadingSize.Sm });

        expect(
            fixture.nativeElement.querySelector('[role="status"]').style.getPropertyValue('--bey-loading-size')
        ).toBe('1.5rem');
    });
});
