import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton, renderComponent } from '@testing/dom';

import { LoadingStyleGuideComponent } from './loading-style-guide.component';

describe('LoadingStyleGuideComponent', () => {
    let fixture: ComponentFixture<LoadingStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(LoadingStyleGuideComponent);
    });

    it('shows the inline sizes and the buttons that trigger the fullscreen and service overlays', () => {
        const text = fixture.nativeElement.textContent;

        expect(text).toContain('angular-components-style-guide.loading.sizes.xs');
        expect(text).toContain('angular-components-style-guide.loading.sizes.custom');
        expect(queryButton(fixture, 'angular-components-style-guide.loading.toggle-fullscreen')).not.toBeNull();
        expect(queryButton(fixture, 'angular-components-style-guide.loading.toggle-service')).not.toBeNull();
    });
});
