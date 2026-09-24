import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from './footer.component';
import { FooterConfig, FooterConfigParameters } from './models/footer.model';

describe('FooterComponent', () => {
    let fixture: ComponentFixture<FooterComponent>;

    function buildConfig(overrides: Partial<FooterConfigParameters> = {}): FooterConfig {
        return new FooterConfig({ iconSrc: '/icon.svg', orgName: 'Acme', productName: 'App', ...overrides });
    }

    async function render(config: FooterConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(FooterComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function links(): HTMLElement[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('nav button')];
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FooterComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])]
        }).compileComponents();
    });

    it('shows the organisation and the product', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('Acme');
        expect(fixture.nativeElement.textContent).toContain('App');
    });

    it('shows the brand icon the config points at', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/icon.svg');
    });

    it('offers no legal navigation when neither url is given', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    });

    it('offers one link per url given', async () => {
        await render(buildConfig({ termsUrl: '/terms' }));
        expect(links()).toHaveLength(1);

        await render(buildConfig({ privacyUrl: '/privacy', termsUrl: '/terms' }));
        expect(links()).toHaveLength(2);
    });

    it('navigates to the terms url when its link is used', async () => {
        await render(buildConfig({ termsUrl: '/terms' }));
        const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        links()[0].click();

        expect(navigate).toHaveBeenCalledWith(['/terms']);
    });

    it('navigates to the privacy url when its link is used', async () => {
        await render(buildConfig({ privacyUrl: '/privacy' }));
        const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

        links()[0].click();

        expect(navigate).toHaveBeenCalledWith(['/privacy']);
    });

    it('embeds the preferences selector without its floating pill', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('bey-floating-preferences')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('.is-pill')).toBeNull();
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ productName: 'Another' }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.textContent).toContain('Another');
    });
});
