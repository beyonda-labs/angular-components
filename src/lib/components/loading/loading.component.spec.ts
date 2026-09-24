import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingComponent } from './loading.component';
import { LoadingSize } from './models/loading.model';

describe('LoadingComponent', () => {
    let fixture: ComponentFixture<LoadingComponent>;

    async function render(size?: LoadingSize | string): Promise<void> {
        fixture = TestBed.createComponent(LoadingComponent);

        if (size !== undefined) {
            fixture.componentRef.setInput('size', size);
        }

        fixture.detectChanges();
        await fixture.whenStable();
    }

    function spinnerSize(): string {
        return fixture.nativeElement.querySelector('[role="status"]').style.getPropertyValue('--bey-loading-size');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('announces itself as busy', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
        expect(fixture.nativeElement.textContent).toContain('angular-components.loading.label');
    });

    it('spins at the medium size by default', async () => {
        await render();

        expect(spinnerSize()).toBe('2.5rem');
    });

    it.each([
        [LoadingSize.Xs, '1rem'],
        [LoadingSize.Sm, '1.5rem'],
        [LoadingSize.Lg, '4rem']
    ])('maps the %s size', async (size, expected) => {
        await render(size);

        expect(spinnerSize()).toBe(expected);
    });

    it('takes a length given instead of a named size', async () => {
        await render('7rem');

        expect(spinnerSize()).toBe('7rem');
    });
});
