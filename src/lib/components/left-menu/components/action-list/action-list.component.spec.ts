import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

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
        fixture = TestBed.createComponent(ActionListComponent);
        fixture.componentRef.setInput('actions', actions);
        fixture.componentRef.setInput('expanded', expanded);
        fixture.componentRef.setInput('prefix', 'demo');
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function labels(): string[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-left-menu-action-label')].map(
            label => label.textContent?.trim() ?? ''
        );
    }

    function rowOf(name: string): HTMLElement {
        const found = [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-left-menu-item')].find(
            item => item.querySelector('.bey-left-menu-action-label')?.textContent?.trim() === name
        );

        if (!found) {
            throw new Error(`No row for ${name}`);
        }

        return found;
    }

    function buttonOf(name: string): HTMLElement {
        return rowOf(name).querySelector('.bey-left-menu-action') as HTMLElement;
    }

    function chevronOf(name: string): HTMLElement {
        return rowOf(name).querySelector('.bey-left-menu-action-chevron') as HTMLElement;
    }

    /* Collapsed rows render no label, so there they are addressed by position. */
    function rowAt(index: number): HTMLElement {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-left-menu-item')][index];
    }

    function flyouts(): HTMLElement[] {
        return [...fixture.nativeElement.querySelectorAll<HTMLElement>('.bey-left-menu-flyout')];
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

            (rowAt(0).querySelector('.bey-left-menu-action') as HTMLElement).dispatchEvent(new MouseEvent('mouseover'));
            fixture.detectChanges();
            expect(flyouts()).toHaveLength(1);

            rowAt(0).dispatchEvent(new MouseEvent('mouseleave'));
            fixture.detectChanges();
            expect(flyouts()).toHaveLength(0);
        });

        it('opens the flyout on a click instead of running the action', async () => {
            const run = jest.fn();
            await render([action('reports', { action: run, subActions: [action('daily')] })], false);

            (rowAt(0).querySelector('.bey-left-menu-action') as HTMLElement).click();
            fixture.detectChanges();

            expect(run).not.toHaveBeenCalled();
            expect(flyouts()).toHaveLength(1);
        });

        it('never opens a flyout for an action without children', async () => {
            await render([action('home')], false);

            (rowAt(0).querySelector('.bey-left-menu-action') as HTMLElement).dispatchEvent(new MouseEvent('mouseover'));
            fixture.detectChanges();

            expect(flyouts()).toHaveLength(0);
        });
    });
});
