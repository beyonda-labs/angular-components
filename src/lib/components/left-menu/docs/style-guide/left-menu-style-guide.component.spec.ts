import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LeftMenuStyleGuideComponent } from './left-menu-style-guide.component';

describe('LeftMenuStyleGuideComponent', () => {
    let component: LeftMenuStyleGuideComponent;
    let fixture: ComponentFixture<LeftMenuStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LeftMenuStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LeftMenuStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
