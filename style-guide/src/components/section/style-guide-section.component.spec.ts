import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { StyleGuideSectionComponent } from './style-guide-section.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StyleGuideSectionComponent],
    standalone: true,
    template: `
        <bey-style-guide-section key="tabs" [titleKey]="titleKey">
            <ng-template><p>demo content</p></ng-template>
        </bey-style-guide-section>
    `
})
class HostComponent {
    titleKey = 'style-guide.tabs';
}

describe('StyleGuideSectionComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    async function render(): Promise<void> {
        fixture = await renderComponent(HostComponent);
    }

    beforeEach(async () => {
        sessionStorage.clear();

        await TestBed.configureTestingModule({
            imports: [HostComponent, TranslateModule.forRoot()]
        }).compileComponents();

        TestBed.inject(TranslateService).setTranslation('en', { 'style-guide': { tabs: 'Tabs' } });
        TestBed.inject(TranslateService).use('en');
    });

    it('renders the translated title as a heading', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('h3').textContent.trim()).toBe('Tabs');
    });

    it('starts collapsed, showing only its title', async () => {
        await render();

        expect(buttonByName(fixture, 'Tabs').getAttribute('aria-expanded')).toBe('false');
        expect(fixture.nativeElement.textContent).not.toContain('demo content');
    });

    it('shows the demo inside the card once its header is clicked, and hides it on a second click', async () => {
        await render();

        buttonByName(fixture, 'Tabs').click();
        await settle(fixture);

        expect(buttonByName(fixture, 'Tabs').getAttribute('aria-expanded')).toBe('true');
        expect(fixture.nativeElement.textContent).toContain('demo content');

        buttonByName(fixture, 'Tabs').click();
        await settle(fixture);

        expect(buttonByName(fixture, 'Tabs').getAttribute('aria-expanded')).toBe('false');
        expect(fixture.nativeElement.textContent).not.toContain('demo content');
    });

    it('points its header at the demo only while the demo is there', async () => {
        await render();

        expect(buttonByName(fixture, 'Tabs').hasAttribute('aria-controls')).toBe(false);

        buttonByName(fixture, 'Tabs').click();
        await settle(fixture);

        const controlled = fixture.nativeElement.querySelector(
            `#${buttonByName(fixture, 'Tabs').getAttribute('aria-controls')}`
        );

        expect(controlled?.textContent).toContain('demo content');

        buttonByName(fixture, 'Tabs').click();
        await settle(fixture);

        expect(buttonByName(fixture, 'Tabs').hasAttribute('aria-controls')).toBe(false);
    });

    it('follows the title key when it changes', async () => {
        await render();

        TestBed.inject(TranslateService).setTranslation('en', { 'style-guide': { tree: 'Tree' } }, true);
        fixture.componentInstance.titleKey = 'style-guide.tree';
        await settle(fixture);

        expect(fixture.nativeElement.querySelector('h3').textContent.trim()).toBe('Tree');
    });
});
