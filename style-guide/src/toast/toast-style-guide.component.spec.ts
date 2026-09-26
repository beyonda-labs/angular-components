import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';
import { ToastrService } from 'ngx-toastr';

import { ToastStyleGuideComponent } from './toast-style-guide.component';

describe('ToastStyleGuideComponent', () => {
    let component: ToastStyleGuideComponent;
    let fixture: ComponentFixture<ToastStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToastStyleGuideComponent, TranslateModule.forRoot()],
            providers: [
                {
                    provide: ToastrService,
                    useValue: {
                        error: jest.fn(),
                        info: jest.fn(),
                        success: jest.fn(),
                        warning: jest.fn()
                    }
                }
            ]
        }).compileComponents();

        fixture = await renderComponent(ToastStyleGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
