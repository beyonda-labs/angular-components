import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { renderComponent, settle } from '@testing/dom';

import { StyleGuideSectionComponent } from './style-guide-section.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [StyleGuideSectionComponent],
    standalone: true,
    template: `
        <bey-style-guide-section [titleKey]="titleKey"><p>demo content</p></bey-style-guide-section>
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

    it('projects the demo inside the card', async () => {
        await render();

        expect(fixture.nativeElement.textContent).toContain('demo content');
    });

    it('follows the title key when it changes', async () => {
        await render();

        TestBed.inject(TranslateService).setTranslation('en', { 'style-guide': { tree: 'Tree' } }, true);
        fixture.componentInstance.titleKey = 'style-guide.tree';
        await settle(fixture);

        expect(fixture.nativeElement.querySelector('h3').textContent.trim()).toBe('Tree');
    });
});
