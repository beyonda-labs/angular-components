import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingStyleGuideComponent } from './loading-style-guide.component';

describe('LoadingStyleGuideComponent', () => {
    let component: LoadingStyleGuideComponent;
    let fixture: ComponentFixture<LoadingStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoadingStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingStyleGuideComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
