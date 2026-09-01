import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderVariant } from '../../models/header.model';
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

    it('should render three header examples, only the back variant with a back button', () => {
        const headers = fixture.nativeElement.querySelectorAll('bey-header');

        expect(headers.length).toBe(3);
        expect(component.config.backAction).toBeUndefined();
        expect(component.backConfig.backAction).toBeDefined();
    });

    it('should render the sub-page example with the SubPage variant', () => {
        expect(component.subPageConfig.variant).toBe(HeaderVariant.SubPage);
    });
});