import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { LoadingStyleGuideComponent } from './loading-style-guide.component';

describe('LoadingStyleGuideComponent', () => {
    let component: LoadingStyleGuideComponent;
    let fixture: ComponentFixture<LoadingStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(LoadingStyleGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
