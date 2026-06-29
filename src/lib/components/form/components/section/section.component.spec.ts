import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormConfig, FormRow, FormSection } from '../../models/form.model';
import { FormService } from '../../services/form.service';
import { FormSectionComponent } from './section.component';

describe('FormSectionComponent', () => {
    let component: FormSectionComponent;
    let fixture: ComponentFixture<FormSectionComponent>;
    let formServiceMock: MockProxy<FormService>;

    const prefixMock = 'prefix';

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionPrefix.mockReturnValue(prefixMock);

        await TestBed.configureTestingModule({
            imports: [FormSectionComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormSectionComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = {} as FormSection;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getSectionLabel', () => {
        // Act
        const result = component.getSectionLabel();

        // Assert
        expect(result).toBe(`${prefixMock}.label`);
    });

    it('getSectionTooltip', () => {
        // Arrange
        component.section = {
            isTooltipVisible: true
        } as FormSection;

        // Act
        const result = component.getSectionTooltip();

        // Assert
        expect(result).toBe(`${prefixMock}.tooltip`);
    });

    describe('isSectionVisible', () => {
        it('should return false if section is hidden', () => {
            // Arrange
            component.section = { isHidden: true } as FormSection;

            // Act
            const result = component.isSectionVisible();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false if all fields are hidden', () => {
            // Arrange
            component.section = {
                isHidden: false,
                rows: [
                    {
                        fields: [
                            {
                                isHidden: true
                            }
                        ]
                    }
                ]
            } as FormSection;

            // Act
            const result = component.isSectionVisible();

            // Assert
            expect(result).toBe(false);
        });

        it('should return true if there are no fields and is not hidden', () => {
            // Arrange
            component.section = {
                isHidden: false,
                rows: [] as FormRow[]
            } as FormSection;

            // Act
            const result = component.isSectionVisible();

            // Assert
            expect(result).toBe(true);
        });

        it('should return true if there are a visible field', () => {
            // Arrange
            component.section = {
                isHidden: false,
                rows: [
                    {
                        fields: [
                            {
                                isHidden: false
                            }
                        ]
                    }
                ]
            } as FormSection;

            // Act
            const result = component.isSectionVisible();

            // Assert
            expect(result).toBe(true);
        });
    });
});
