import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, textsOf } from '@testing/dom';
import { ToastrService } from 'ngx-toastr';

import { ToastStyleGuideComponent } from './toast-style-guide.component';

describe('ToastStyleGuideComponent', () => {
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
    });

    it('offers one button per kind of toast', () => {
        expect(textsOf(queryAll(fixture, 'button'))).toEqual([
            'angular-components-style-guide.toast.buttons.success',
            'angular-components-style-guide.toast.buttons.info',
            'angular-components-style-guide.toast.buttons.warning',
            'angular-components-style-guide.toast.buttons.error'
        ]);
    });
});
