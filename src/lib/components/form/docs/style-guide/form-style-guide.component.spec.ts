import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { FormStyleGuideComponent } from './form-style-guide.component';

class FakeTranslateLoader implements TranslateLoader {
    getTranslation() {
        return of({});
    }
}

describe('FormStyleGuideComponent', () => {
    let component: FormStyleGuideComponent;
    let fixture: ComponentFixture<FormStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormStyleGuideComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
                })
            ],
            providers: []
        }).compileComponents();

        fixture = TestBed.createComponent(FormStyleGuideComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
