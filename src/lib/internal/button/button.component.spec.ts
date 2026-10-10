import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, textsOf } from '@testing/dom';

import { ButtonComponent } from './button.component';
import { ButtonConfig, ButtonParameters } from './models/button-config.model';

describe('ButtonComponent', () => {
    let fixture: ComponentFixture<ButtonComponent>;

    function buildButton(overrides: Partial<ButtonParameters> = {}): ButtonConfig {
        return new ButtonConfig({ action: jest.fn(), label: 'demo.save', ...overrides });
    }

    async function render(button: ButtonConfig = buildButton()): Promise<void> {
        fixture = await renderComponent(ButtonComponent, { button });
    }

    function buttons(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'button');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', { demo: { delete: 'Delete', save: 'Save' } });
        translate.use('en');
    });

    it('renders the translated label', async () => {
        await render();

        expect(textsOf(buttons())).toEqual(['Save']);
    });

    it('names an icon-only button with its translated aria label', async () => {
        await render(buildButton({ ariaLabel: 'demo.delete', icon: faTrash, label: '' }));

        expect(buttonByName(fixture, 'Delete').textContent?.trim()).toBe('');
    });

    it('leaves the name to the label when the config gives no aria label', async () => {
        await render();

        expect(buttonByName(fixture, 'Save').hasAttribute('aria-label')).toBe(false);
    });

    it('is described by the element the config points at, and by nothing otherwise', async () => {
        await render(buildButton({ describedBy: 'demo-note' }));
        expect(buttonByName(fixture, 'Save').getAttribute('aria-describedby')).toBe('demo-note');

        await render();
        expect(buttonByName(fixture, 'Save').hasAttribute('aria-describedby')).toBe(false);
    });

    it('renders nothing when hidden', async () => {
        await render(buildButton({ isHidden: true }));

        expect(buttons()).toHaveLength(0);
    });

    it('runs the action on click', async () => {
        const action = jest.fn();
        await render(buildButton({ action }));

        buttonByName(fixture, 'Save').click();

        expect(action).toHaveBeenCalledTimes(1);
    });

    it('is disabled and does not run the action when the config disables it', async () => {
        const action = jest.fn();
        await render(buildButton({ action, isDisabled: true }));

        const button = buttonByName(fixture, 'Save');

        button.click();

        expect(button.disabled).toBe(true);
        expect(action).not.toHaveBeenCalled();
    });

    it('tells assistive technology a pressed button is pressed, and says nothing of the others', async () => {
        await render(buildButton({ isPressed: true }));
        expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');

        await render();
        expect(buttons()[0].hasAttribute('aria-pressed')).toBe(false);
    });
});
