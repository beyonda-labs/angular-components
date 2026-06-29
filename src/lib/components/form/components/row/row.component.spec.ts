import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConfig, FormRow, FormSection } from '../../models/form.model';
import { FormRowComponent } from './row.component';

describe('FormRowComponent', () => {
    let component: FormRowComponent;
    let fixture: ComponentFixture<FormRowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormRowComponent],
            providers: []
        }).compileComponents();

        fixture = TestBed.createComponent(FormRowComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = {} as FormSection;
        component.row = {} as FormRow;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
