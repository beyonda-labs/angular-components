import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AppLayoutStyleGuideComponent } from './app-layout-style-guide.component';

describe('AppLayoutStyleGuideComponent', () => {
    let component: AppLayoutStyleGuideComponent;
    let fixture: ComponentFixture<AppLayoutStyleGuideComponent>;

    beforeEach(async () => {
        global.ResizeObserver = class {
            observe(): void {}
            unobserve(): void {}
            disconnect(): void {}
        } as unknown as typeof ResizeObserver;

        await TestBed.configureTestingModule({
            imports: [AppLayoutStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AppLayoutStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
