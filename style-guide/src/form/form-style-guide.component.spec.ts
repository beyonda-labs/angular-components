import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { queryButton, renderComponent } from '@testing/dom';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { FormStyleGuideComponent } from './form-style-guide.component';

class FakeTranslateLoader implements TranslateLoader {
    getTranslation() {
        return of({});
    }
}

describe('FormStyleGuideComponent', () => {
    let fixture: ComponentFixture<FormStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormStyleGuideComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
                })
            ],
            providers: [{ provide: BsModalService, useValue: { show: jest.fn() } }]
        }).compileComponents();

        fixture = await renderComponent(FormStyleGuideComponent);
    });

    it('shows the form example and the button that opens the modal form', () => {
        expect(fixture.nativeElement.textContent).toContain('angular-components-style-guide.form.example');
        expect(queryButton(fixture, 'angular-components-style-guide.form.modal.open')).not.toBeNull();
    });
});
