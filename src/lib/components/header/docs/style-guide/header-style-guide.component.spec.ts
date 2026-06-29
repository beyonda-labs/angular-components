import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderStyleGuideComponent } from './header-style-guide.component';

describe('HeaderStyleGuideComponent', () => {
    let component: HeaderStyleGuideComponent;
    let fixture: ComponentFixture<HeaderStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});