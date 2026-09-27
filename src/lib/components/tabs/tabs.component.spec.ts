import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { Tab, TabsConfig, TabsConfigParameters } from './models/tabs.model';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
    let fixture: ComponentFixture<TabsComponent>;

    function buildConfig(overrides: Partial<TabsConfigParameters> = {}): TabsConfig {
        return new TabsConfig({
            prefix: 'demo',
            tabs: [
                new Tab({ key: 'general', label: 'General' }),
                new Tab({ key: 'details', label: 'Details' }),
                new Tab({ key: 'history', label: 'History' })
            ],
            ...overrides
        });
    }

    async function render(config: TabsConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(TabsComponent, { config });
    }

    function tabs(): HTMLElement[] {
        return queryAll(fixture, '[role="tab"]');
    }

    function tab(name: string): HTMLElement {
        const found = tabs().find(element => element.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No tab named ${name}`);
        }

        return found;
    }

    function press(key: string): void {
        tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        fixture.detectChanges();
    }

    function selectedTabName(): string | undefined {
        return tabs()
            .find(element => element.getAttribute('aria-selected') === 'true')
            ?.textContent?.trim();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TabsComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders one tab per entry in the config', async () => {
        await render();

        expect(textsOf(tabs())).toEqual(['General', 'Details', 'History']);
    });

    it('labels a camelCase tab key from its kebab-case segment and reports the key', async () => {
        const onTabChange = jest.fn();
        await render(
            buildConfig({ onTabChange, tabs: [new Tab({ key: 'general' }), new Tab({ key: 'billingDetails' })] })
        );

        tab('demo.tabs.billing-details.label').click();
        fixture.detectChanges();

        expect(onTabChange).toHaveBeenCalledWith('billingDetails');
    });

    it('selects the first tab when the config names none', async () => {
        await render();

        expect(selectedTabName()).toBe('General');
    });

    it('selects the tab the config names', async () => {
        await render(buildConfig({ activeTab: 'history' }));

        expect(selectedTabName()).toBe('History');
    });

    it('moves the selection to the clicked tab and reports it', async () => {
        const onTabChange = jest.fn();
        await render(buildConfig({ onTabChange }));

        tab('Details').click();
        fixture.detectChanges();

        expect(selectedTabName()).toBe('Details');
        expect(onTabChange).toHaveBeenCalledWith('details');
    });

    it('reports a change only once per tab', async () => {
        const onTabChange = jest.fn();
        await render(buildConfig({ onTabChange }));

        tab('Details').click();
        tab('Details').click();
        fixture.detectChanges();

        expect(onTabChange).toHaveBeenCalledTimes(1);
    });

    it('ignores a disabled tab', async () => {
        const onTabChange = jest.fn();
        await render(
            buildConfig({
                onTabChange,
                tabs: [
                    new Tab({ key: 'general', label: 'General' }),
                    new Tab({ key: 'locked', label: 'Locked', isDisabled: true })
                ]
            })
        );

        tab('Locked').click();
        fixture.detectChanges();

        expect(selectedTabName()).toBe('General');
        expect(onTabChange).not.toHaveBeenCalled();
    });

    it('walks the tabs with the arrow keys, wrapping around', async () => {
        await render();

        press('ArrowRight');
        expect(selectedTabName()).toBe('Details');

        press('ArrowLeft');
        expect(selectedTabName()).toBe('General');

        press('ArrowLeft');
        expect(selectedTabName()).toBe('History');
    });

    it('jumps to the first and last tab with Home and End', async () => {
        await render(buildConfig({ activeTab: 'details' }));

        press('End');
        expect(selectedTabName()).toBe('History');

        press('Home');
        expect(selectedTabName()).toBe('General');
    });

    it('skips disabled tabs when walking with the keyboard', async () => {
        await render(
            buildConfig({
                tabs: [
                    new Tab({ key: 'general', label: 'General' }),
                    new Tab({ key: 'locked', label: 'Locked', isDisabled: true }),
                    new Tab({ key: 'history', label: 'History' })
                ]
            })
        );

        press('ArrowRight');

        expect(selectedTabName()).toBe('History');
    });

    it('resolves a label the consumer did not give from the config prefix', async () => {
        await render(buildConfig({ tabs: [new Tab({ key: 'general' })] }));

        expect(tabs()[0].textContent?.trim()).toBe('demo.tabs.general.label');
    });

    it('marks the tab list for assistive technology', async () => {
        await render();

        const list = fixture.nativeElement.querySelector('[role="tablist"]');

        expect(list.getAttribute('aria-label')).toBe('angular-components.tabs.label');
        expect(tabs().map(element => element.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ activeTab: 'details' }));
        await settle(fixture);

        expect(selectedTabName()).toBe('Details');
    });
});
