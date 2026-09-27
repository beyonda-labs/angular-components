import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, renderComponent, textsOf } from '@testing/dom';

import { LeftMenuAction } from '../../models/left-menu.model';
import { ActionListComponent } from './action-list.component';

describe('ActionListComponent', () => {
    let fixture: ComponentFixture<ActionListComponent>;

    function action(
        key: string,
        overrides: Partial<ConstructorParameters<typeof LeftMenuAction>[0]> = {}
    ): LeftMenuAction {
        return new LeftMenuAction({ key, label: key, ...overrides });
    }

    async function render(actions: LeftMenuAction[], expanded = true): Promise<void> {
        fixture = await renderComponent(ActionListComponent, { actions, expanded, prefix: 'demo' });
    }

    function buttons(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'button');
    }

    function labels(): string[] {
        return textsOf(buttons());
    }

    function buttonOf(name: string): HTMLButtonElement {
        return buttonByName(fixture, name);
    }

    function chevronOf(name: string): HTMLElement {
        return buttonOf(name).querySelector(':scope > span[aria-hidden="true"]') as HTMLElement;
    }

    function rowOf(name: string): HTMLElement {
        return buttonOf(name).parentElement as HTMLElement;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActionListComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders one row per action', async () => {
        await render([action('home'), action('settings')]);

        expect(labels()).toEqual(['home', 'settings']);
    });

    it('builds the label from the prefix when the action carries none', async () => {
        await render([new LeftMenuAction({ key: 'home' })]);

        expect(labels()).toEqual(['demo.actions.home.label']);
    });

    it('builds the label of a camelCase action key from its kebab-case segment', async () => {
        await render([new LeftMenuAction({ key: 'userSettings' })]);

        expect(labels()).toEqual(['demo.actions.user-settings.label']);
    });

    it('runs the action of a leaf and reports it', async () => {
        const run = jest.fn();
        const triggered = jest.fn();
        await render([action('home', { action: run })]);
        fixture.componentInstance.actionTriggered.subscribe(triggered);

        buttonOf('home').click();

        expect(run).toHaveBeenCalled();
        expect(triggered).toHaveBeenCalled();
    });

    it('ignores a disabled action', async () => {
        const run = jest.fn();
        await render([action('home', { action: run, disabled: true })]);

        buttonOf('home').click();

        expect(run).not.toHaveBeenCalled();
    });

    describe('expanded', () => {
        it('opens and closes a branch that has no action of its own', async () => {
            await render([action('reports', { subActions: [action('daily')] })]);

            expect(labels()).toEqual(['reports']);

            buttonOf('reports').click();
            fixture.detectChanges();
            expect(labels()).toEqual(['reports', 'daily']);

            buttonOf('reports').click();
            fixture.detectChanges();
            expect(labels()).toEqual(['reports']);
        });

        it('runs the action of a branch that has one, and only opens it from the chevron', async () => {
            const run = jest.fn();
            await render([action('reports', { action: run, subActions: [action('daily')] })]);

            buttonOf('reports').click();
            fixture.detectChanges();
            expect(run).toHaveBeenCalled();
            expect(labels()).toEqual(['reports']);

            chevronOf('reports').click();
            fixture.detectChanges();
            expect(labels()).toContain('daily');
        });

        it('opens the branch that holds the active action', async () => {
            await render([action('reports', { subActions: [action('daily', { active: true })] })]);

            expect(labels()).toEqual(['reports', 'daily']);
        });

        it('lets an open branch be closed even while a descendant is active', async () => {
            await render([action('reports', { subActions: [action('daily', { active: true })] })]);

            buttonOf('reports').click();
            fixture.detectChanges();

            expect(labels()).toEqual(['reports']);
        });

        it('closes the branch that was open when another one opens', async () => {
            await render([
                action('reports', { subActions: [action('daily')] }),
                action('admin', { subActions: [action('users')] })
            ]);

            buttonOf('reports').click();
            fixture.detectChanges();
            expect(labels()).toContain('daily');

            buttonOf('admin').click();
            fixture.detectChanges();

            expect(labels()).toContain('users');
            expect(labels()).not.toContain('daily');
        });
    });

    describe('collapsed', () => {
        it('opens a flyout on hover and closes it on leave', async () => {
            await render([action('reports', { subActions: [action('daily')] })], false);

            buttonOf('reports').dispatchEvent(new MouseEvent('mouseover'));
            fixture.detectChanges();
            expect(buttonOf('reports').getAttribute('aria-expanded')).toBe('true');
            expect(labels()).toContain('daily');

            rowOf('reports').dispatchEvent(new MouseEvent('mouseleave'));
            fixture.detectChanges();
            expect(buttonOf('reports').getAttribute('aria-expanded')).toBe('false');
            expect(labels()).not.toContain('daily');
        });

        it('opens the flyout on a click instead of running the action', async () => {
            const run = jest.fn();
            await render([action('reports', { action: run, subActions: [action('daily')] })], false);

            buttonOf('reports').click();
            fixture.detectChanges();

            expect(run).not.toHaveBeenCalled();
            expect(buttonOf('reports').getAttribute('aria-expanded')).toBe('true');
            expect(labels()).toContain('daily');
        });

        it('never opens a flyout for an action without children', async () => {
            await render([action('home')], false);

            buttonOf('home').dispatchEvent(new MouseEvent('mouseover'));
            fixture.detectChanges();

            expect(buttonOf('home').getAttribute('aria-expanded')).toBeNull();
            expect(fixture.nativeElement.textContent).not.toContain('home');
        });
    });
});
