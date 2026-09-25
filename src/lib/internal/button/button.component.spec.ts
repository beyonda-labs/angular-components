import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from './button.component';
import { ButtonConfig, ButtonParameters, ButtonType } from './models/button-config.model';

describe('ButtonComponent', () => {
    let fixture: ComponentFixture<ButtonComponent>;
    let element: HTMLElement;

    function render(overrides: Partial<ButtonParameters> = {}): HTMLButtonElement | null {
        fixture.componentRef.setInput(
            'button',
            new ButtonConfig({ action: jest.fn(), label: 'demo.label', ...overrides })
        );
        fixture.detectChanges();

        return element.querySelector('button');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        element = fixture.nativeElement;
    });

    it('should render the label with the primary look by default', () => {
        const button = render();

        expect(button?.textContent?.trim()).toBe('demo.label');
        expect(button?.classList).toContain('btn-dark');
    });

    it.each([
        [ButtonType.Secondary, 'btn-outline-dark'],
        [ButtonType.Tertiary, 'btn-link'],
        [ButtonType.LinkSecondary, 'btn-link-secondary']
    ])('should map the %s type to its bootstrap class', (type, expected) => {
        expect(render({ type })?.classList).toContain(expected);
    });

    it('should add the custom class to the button and to the host', () => {
        const button = render({ customClass: 'demo-class' });

        expect(button?.classList).toContain('demo-class');
        expect(element.classList).toContain('demo-class');
    });

    it('should render nothing when hidden', () => {
        expect(render({ isHidden: true })).toBeNull();
    });

    it('should run the action on click unless disabled', () => {
        const action = jest.fn();

        render({ action })?.click();
        expect(action).toHaveBeenCalledTimes(1);

        render({ action, isDisabled: true })?.click();
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('should show the icon before the label', () => {
        const button = render({ icon: { iconName: 'plus', prefix: 'fas', icon: [512, 512, [], '', ''] } });

        expect(button?.querySelector('fa-icon.bey-button-icon')).not.toBeNull();
    });
});
