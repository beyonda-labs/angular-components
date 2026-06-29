import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';
import { ButtonConfig, ButtonType } from './models/button-config.model';

const createButton = (overrides?: Partial<ButtonConfig>): ButtonConfig =>
    ({
        type: ButtonType.Primary,
        label: 'test',
        isDisabled: false,
        action: jest.fn(),
        ...overrides
    }) as ButtonConfig;

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getClasses()', () => {
        it('should return empty string when button is undefined', () => {
            component.button = undefined as unknown as ButtonConfig;

            expect(component.getClasses()).toBe('');
        });

        it('should return primary button classes', () => {
            component.button = createButton({ type: ButtonType.Primary });

            const classes = component.getClasses();

            expect(classes).toContain('btn');
            expect(classes).toContain('btn-dark');
        });

        it('should return secondary button classes', () => {
            component.button = createButton({ type: ButtonType.Secondary });

            const classes = component.getClasses();

            expect(classes).toContain('btn');
            expect(classes).toContain('btn-outline-dark');
        });

        it('should return tertiary button classes', () => {
            component.button = createButton({ type: ButtonType.Tertiary });

            const classes = component.getClasses();

            expect(classes).toContain('btn');
            expect(classes).toContain('btn-link');
        });

        it('should return link-secondary button classes', () => {
            component.button = createButton({ type: ButtonType.LinkSecondary });

            const classes = component.getClasses();

            expect(classes).toContain('btn');
            expect(classes).toContain('btn-link');
            expect(classes).toContain('btn-link-secondary');
        });
    });

    describe('onClick()', () => {
        it('should call action when button is enabled', () => {
            const action = jest.fn();
            component.button = createButton({ action, isDisabled: false });

            component.onClick();

            expect(action).toHaveBeenCalledTimes(1);
        });

        it('should NOT call action when button is disabled', () => {
            const action = jest.fn();
            component.button = createButton({ action, isDisabled: true });

            component.onClick();

            expect(action).not.toHaveBeenCalled();
        });

        it('should NOT throw if button is undefined', () => {
            component.button = undefined as unknown as ButtonConfig;

            expect(() => component.onClick()).not.toThrow();
        });
    });
});
