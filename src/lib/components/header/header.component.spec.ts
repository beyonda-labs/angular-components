import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import { BadgeConfig } from '../badge/models/badge.model';
import { HeaderComponent } from './header.component';
import { HeaderAction, HeaderActionType, HeaderConfig, HeaderConfigParameters } from './models/header.model';

describe('HeaderComponent', () => {
    let fixture: ComponentFixture<HeaderComponent>;

    function buildAction(overrides: Partial<ConstructorParameters<typeof HeaderAction>[0]> = {}): HeaderAction {
        return new HeaderAction({ key: 'save', type: HeaderActionType.PrimaryButton, ...overrides });
    }

    function buildConfig(overrides: Partial<HeaderConfigParameters> = {}): HeaderConfig {
        return new HeaderConfig({ prefix: 'demo', title: 'demo.title', ...overrides });
    }

    async function render(config: HeaderConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(HeaderComponent, { config });
    }

    function buttons(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'button');
    }

    function labels(): string[] {
        return textsOf(buttons());
    }

    function panels(): HTMLElement[] {
        return queryAll(fixture, '[role="group"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('shows the title and repeats it as a native tooltip, since it truncates', async () => {
        await render();

        const title = fixture.nativeElement.querySelector('h1');

        expect(title.textContent.trim()).toBe('demo.title');
        expect(title.getAttribute('title')).toBe('demo.title');
    });

    it('shows nothing but the title when there is nothing else', async () => {
        await render();

        expect(buttons()).toHaveLength(0);
        expect(fixture.nativeElement.querySelector('bey-badge')).toBeNull();
    });

    it('drops the title when the config does not give one', async () => {
        await render(buildConfig({ title: '' }));

        expect(fixture.nativeElement.querySelector('h1')).toBeNull();
    });

    it('shows the badge the config gives', async () => {
        await render(buildConfig({ badge: new BadgeConfig({ label: 'demo.badge' }) }));

        const badge = fixture.nativeElement.querySelector('bey-badge');

        expect(badge.textContent.trim()).toBe('demo.badge');
    });

    it('puts the back action before the title', async () => {
        await render(buildConfig({ backAction: buildAction({ key: 'back', type: HeaderActionType.Icon }) }));

        const rendered = queryAll(fixture, 'button, h1');

        expect(rendered[0].tagName).toBe('BUTTON');
        expect(rendered[1].tagName).toBe('H1');
    });

    it('renders the left actions, then the overflow toggle, then the right actions', async () => {
        await render(
            buildConfig({
                leftActions: [buildAction({ key: 'left', label: 'Left' })],
                menuActions: [buildAction({ key: 'menu', label: 'Menu' })],
                rightActions: [buildAction({ key: 'right', label: 'Right' })]
            })
        );

        expect(labels()).toEqual(['Left', '', 'Right']);
    });

    it('falls back to keys built from the prefix when an action carries no text', async () => {
        await render(buildConfig({ leftActions: [buildAction({ key: 'save' })] }));

        expect(labels()).toEqual(['demo.actions.save.label']);
    });

    it('shows no label for an icon-only action', async () => {
        await render(
            buildConfig({ leftActions: [buildAction({ key: 'add', icon: faPlus, type: HeaderActionType.Icon })] })
        );

        expect(labels()).toEqual(['']);
    });

    it('runs the action behind a button', async () => {
        const action = jest.fn();
        await render(buildConfig({ leftActions: [buildAction({ key: 'save', label: 'Save', action })] }));

        buttons()[0].click();

        expect(action).toHaveBeenCalled();
    });

    it('disables an action that says it is disabled', async () => {
        await render(buildConfig({ leftActions: [buildAction({ key: 'save', label: 'Save', disabled: true })] }));

        expect(buttons()[0].disabled).toBe(true);
    });

    it('opens and closes the overflow menu', async () => {
        await render(buildConfig({ menuActions: [buildAction({ key: 'archive', label: 'Archive' })] }));

        expect(panels()).toHaveLength(0);

        buttons()[0].click();
        await settle(fixture);
        expect(labels()).toContain('Archive');

        buttons()[0].click();
        await settle(fixture);
        expect(panels()).toHaveLength(0);
    });

    it('closes the overflow menu once one of its actions runs', async () => {
        const action = jest.fn();
        await render(buildConfig({ menuActions: [buildAction({ key: 'archive', label: 'Archive', action })] }));

        buttons()[0].click();
        await settle(fixture);

        queryButton(fixture, 'Archive')?.click();
        await settle(fixture);

        expect(action).toHaveBeenCalled();
        expect(panels()).toHaveLength(0);
    });

    it('closes an open menu on escape and on a click outside', async () => {
        await render(buildConfig({ menuActions: [buildAction({ key: 'archive', label: 'Archive' })] }));

        buttons()[0].click();
        await settle(fixture);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await settle(fixture);
        expect(panels()).toHaveLength(0);

        buttons()[0].click();
        await settle(fixture);
        document.body.click();
        await settle(fixture);
        expect(panels()).toHaveLength(0);
    });

    it('opens the sub-actions of an action that has them, instead of running it', async () => {
        const action = jest.fn();
        await render(
            buildConfig({
                leftActions: [
                    buildAction({
                        key: 'export',
                        label: 'Export',
                        action,
                        subActions: [buildAction({ key: 'pdf', label: 'PDF', icon: faGear })]
                    })
                ]
            })
        );

        buttons()[0].click();
        await settle(fixture);

        expect(action).not.toHaveBeenCalled();
        expect(labels()).toContain('PDF');
    });

    it('closes the sub-actions once one of them runs', async () => {
        const subAction = jest.fn();
        await render(
            buildConfig({
                leftActions: [
                    buildAction({
                        key: 'export',
                        label: 'Export',
                        subActions: [buildAction({ key: 'pdf', label: 'PDF', action: subAction })]
                    })
                ]
            })
        );

        buttons()[0].click();
        await settle(fixture);
        queryButton(fixture, 'PDF')?.click();
        await settle(fixture);

        expect(subAction).toHaveBeenCalled();
        expect(panels()).toHaveLength(0);
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ title: 'demo.other' }));
        await settle(fixture);

        expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('demo.other');
    });
});
