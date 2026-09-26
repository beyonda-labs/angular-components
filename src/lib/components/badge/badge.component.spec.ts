import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BadgeComponent } from './badge.component';
import { BadgeConfig } from './models/badge.model';

describe('BadgeComponent', () => {
    let fixture: ComponentFixture<BadgeComponent>;
    let element: HTMLElement;

    function render(config: BadgeConfig): HTMLElement {
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();

        return element;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BadgeComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', { demo: { active: 'Active' } });
        translate.use('en');

        fixture = TestBed.createComponent(BadgeComponent);
        element = fixture.nativeElement;
    });

    it('should translate the label by default', () => {
        const badge = render(new BadgeConfig({ label: 'demo.active' }));

        expect(badge.textContent?.trim()).toBe('Active');
    });

    it('should show the label as is when translate is off', () => {
        const badge = render(new BadgeConfig({ label: 'demo.active', translate: false }));

        expect(badge.textContent?.trim()).toBe('demo.active');
    });

    it('should follow a replaced config', () => {
        render(new BadgeConfig({ label: 'demo.active' }));
        const badge = render(new BadgeConfig({ label: 'demo.active', translate: false }));

        expect(badge.textContent?.trim()).toBe('demo.active');
    });
});
