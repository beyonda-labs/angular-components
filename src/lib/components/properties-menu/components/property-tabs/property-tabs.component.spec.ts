import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTabsComponent } from './property-tabs.component';

describe('PropertyTabsComponent', () => {
    let fixture: ComponentFixture<PropertyTabsComponent>;
    let service: PropertiesMenuService;

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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTabsComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', {
            test: {
                'properties-menu': { tabs: { 'add-block': { label: 'Add block' }, structure: { label: 'Structure' } } }
            }
        });
        translate.use('en');

        service = TestBed.inject(PropertiesMenuService);
        service.setConfig(
            new PropertiesMenuConfig({
                prefix: 'test.properties-menu',
                tabs: [new PropertyTab({ id: 'structure' }), new PropertyTab({ id: 'add-block' })]
            })
        );
        fixture = await renderComponent(PropertyTabsComponent);
    });

    it('renders one tab per tab of the menu config, the first one open', () => {
        expect(textsOf(tabs())).toEqual(['Structure', 'Add block']);
        expect(tab('Structure').getAttribute('aria-selected')).toBe('true');
    });

    it('opens the tab the user clicks', async () => {
        tab('Add block').click();
        await settle(fixture);

        expect(service.activeTabId()).toBe('add-block');
        expect(tab('Add block').getAttribute('aria-selected')).toBe('true');
    });
});
