import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter,Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from './footer.component';
import { FooterConfig } from './models/footer.model';

const createConfig = (overrides: Partial<ConstructorParameters<typeof FooterConfig>[0]> = {}): FooterConfig =>
    new FooterConfig({ iconSrc: '/icon.svg', orgName: 'Acme', productName: 'App', ...overrides });

describe('FooterComponent', () => {
    let component: FooterComponent;
    let fixture: ComponentFixture<FooterComponent>;
    let cd: ChangeDetectorRef;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FooterComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(FooterComponent);
        component = fixture.componentInstance;
        cd = fixture.debugElement.injector.get(ChangeDetectorRef);
        component.config = createConfig();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render orgName and productName', () => {
        const element: HTMLElement = fixture.nativeElement;
        expect(element.textContent).toContain('Acme');
        expect(element.textContent).toContain('App');
    });

    it('should not render links nav when no URLs are provided', () => {
        const nav = fixture.nativeElement.querySelector('nav');
        expect(nav).toBeNull();
    });

    it('should render one button when termsUrl is provided', () => {
        component.config = createConfig({ termsUrl: '/terms' });
        cd.markForCheck();
        fixture.detectChanges();
        const nav = fixture.nativeElement.querySelector('nav');
        expect(nav).toBeTruthy();
        const buttons: NodeListOf<Element> = nav.querySelectorAll('bey-button');
        expect(buttons.length).toBe(1);
    });

    it('should render two buttons when termsUrl and privacyUrl are provided', () => {
        component.config = createConfig({ termsUrl: '/terms', privacyUrl: '/privacy' });
        cd.markForCheck();
        fixture.detectChanges();
        const buttons: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('bey-button');
        expect(buttons.length).toBe(2);
    });

    it('should navigate to termsUrl on terms button click', () => {
        component.config = createConfig({ termsUrl: '/terms' });
        fixture.detectChanges();
        const router = TestBed.inject(Router);
        const navigateSpy = jest.spyOn(router, 'navigate');
        component.termsButton.action();
        expect(navigateSpy).toHaveBeenCalledWith(['/terms']);
    });
});
