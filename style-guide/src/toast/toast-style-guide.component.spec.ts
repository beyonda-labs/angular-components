import { ComponentFixture, TestBed } from '@angular/core/testing';
import { queryAll, renderComponent, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { ToastStyleGuideComponent } from './toast-style-guide.component';

describe('ToastStyleGuideComponent', () => {
    let fixture: ComponentFixture<ToastStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToastStyleGuideComponent],
            providers: [provideBeyTesting()]
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
