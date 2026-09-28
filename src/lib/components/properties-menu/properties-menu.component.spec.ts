import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import { PropertyTextField } from './models/fields/property-text-field.model';
import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from './models/properties-menu-config.model';
import { PropertyGroup } from './models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyGroupTab,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from './models/property-group-content.model';
import { PropertyListItem } from './models/property-list-item.model';
import { PropertySummaryRow } from './models/property-summary-row.model';
import { PropertyTab } from './models/property-tab.model';
import { PropertyTreeConfig } from './models/property-tree-config.model';
import { PropertyTreeNode } from './models/property-tree-node.model';
import { PropertyVariable } from './models/property-variable.model';
import { PropertiesMenuComponent } from './properties-menu.component';
import { PropertiesMenuService } from './services/properties-menu.service';

function buildConfig(overrides: Partial<PropertiesMenuConfigParameters> = {}): PropertiesMenuConfig {
    return new PropertiesMenuConfig({
        activeTabId: 'properties',
        prefix: 'app.properties-menu',
        subtitle: 'Block: heading',
        tabs: [
            new PropertyTab({
                groups: [
                    new PropertyGroup({
                        content: new PropertyFieldsContent({
                            fields: [
                                new PropertyTextField({
                                    acceptsVariable: true,
                                    id: 'text',
                                    label: 'Text',
                                    value: 'INVOICE'
                                })
                            ]
                        }),
                        expanded: true,
                        id: 'content',
                        label: 'Content'
                    })
                ],
                id: 'properties',
                label: 'Properties'
            }),
            new PropertyTab({ groups: [], id: 'page', label: 'Page' }),
            new PropertyTab({
                groups: [
                    new PropertyGroup({
                        content: new PropertyTreeContent({
                            tree: new PropertyTreeConfig({
                                nodes: [new PropertyTreeNode({ id: 'page-1', label: 'Page 1' })]
                            })
                        }),
                        id: 'structure-tree',
                        showHeader: false
                    })
                ],
                id: 'structure',
                label: 'Structure'
            }),
            new PropertyTab({
                groups: [
                    new PropertyGroup({
                        content: new PropertyListContent({
                            list: [new PropertyListItem({ id: 'block-heading', label: 'Heading' })]
                        }),
                        id: 'simple-blocks',
                        showHeader: false
                    })
                ],
                id: 'add',
                label: 'Add'
            })
        ],
        title: 'Title',
        ...overrides
    });
}

describe('PropertiesMenuComponent', () => {
    let fixture: ComponentFixture<PropertiesMenuComponent>;
    let element: HTMLElement;

    function render(config: PropertiesMenuConfig, variables?: PropertyVariable[]): void {
        fixture.componentRef.setInput('config', config);

        if (variables) {
            fixture.componentRef.setInput('variables', variables);
        }

        fixture.detectChanges();
    }

    function closeButton(): HTMLButtonElement | null {
        return queryButton(element, 'angular-components.properties-menu.close');
    }

    function service(): PropertiesMenuService {
        return fixture.debugElement.injector.get(PropertiesMenuService);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertiesMenuComponent);
        element = fixture.nativeElement;
    });

    it('should render the header title and subtitle', () => {
        render(buildConfig());

        expect(element.textContent).toContain('Title');
        expect(element.textContent).toContain('Block: heading');
    });

    it('should resolve the default title from the prefix', () => {
        render(buildConfig({ title: undefined }));

        expect(element.textContent).toContain('app.properties-menu.title');
    });

    it('should hide the header when embedded', () => {
        render(buildConfig({ embedded: true }));

        expect(element.querySelector('bey-properties-menu-header')).toBeNull();
        expect(element.textContent).not.toContain('Title');
    });

    it('should show the close button only when onClose is configured', () => {
        const onClose = jest.fn();

        render(buildConfig());
        expect(closeButton()).toBeNull();

        render(buildConfig({ onClose }));
        closeButton()?.click();

        expect(onClose).toHaveBeenCalled();
    });

    it('should render the configured active tab and the tab strip', () => {
        render(buildConfig());

        expect(element.querySelector('bey-property-tabs')).not.toBeNull();
        expect(element.querySelector('bey-property-field')).not.toBeNull();
    });

    it('should hide the tab strip with a single visible tab', () => {
        render(buildConfig({ tabs: [new PropertyTab({ groups: [], id: 'only' })] }));

        expect(element.querySelector('bey-property-tabs')).toBeNull();
    });

    it('should follow a replaced config', () => {
        render(buildConfig());
        render(buildConfig({ activeTabId: 'page', subtitle: 'Block: page' }));

        expect(element.textContent).toContain('Block: page');
        expect(element.querySelector('bey-property-field')).toBeNull();
    });

    it('should call onActiveTabChange when the active tab changes', () => {
        const onActiveTabChange = jest.fn();

        render(buildConfig({ onActiveTabChange }));
        service().setActiveTab('page');

        expect(onActiveTabChange).toHaveBeenCalledWith('page');
    });

    it('should call onFieldValueChange when a field value is updated', () => {
        const onFieldValueChange = jest.fn();

        render(buildConfig({ onFieldValueChange }));
        service().updateFieldValue('text', 'NEW TEXT');

        expect(onFieldValueChange).toHaveBeenCalledWith({
            fieldId: 'text',
            previousValue: 'INVOICE',
            value: 'NEW TEXT'
        });
    });

    it('should call onGroupToggle when a group is collapsed', () => {
        const onGroupToggle = jest.fn();

        render(buildConfig({ onGroupToggle }));
        service().toggleGroup('properties', 'content');

        expect(onGroupToggle).toHaveBeenCalledWith({ expanded: false, groupId: 'content', tabId: 'properties' });
    });

    it('should call onTreeNodeSelect when a tree node is selected', () => {
        const onTreeNodeSelect = jest.fn();

        render(buildConfig({ onTreeNodeSelect }));
        service().selectTreeNode('structure', 'structure-tree', 'page-1');

        expect(onTreeNodeSelect).toHaveBeenCalledWith(
            expect.objectContaining({ groupId: 'structure-tree', nodeId: 'page-1', tabId: 'structure' })
        );
    });

    it('should call onListItemSelect when a list item is selected', () => {
        const onListItemSelect = jest.fn();

        render(buildConfig({ onListItemSelect }));
        service().selectListItem('add', 'simple-blocks', 'block-heading');

        expect(onListItemSelect).toHaveBeenCalledWith(
            expect.objectContaining({ groupId: 'simple-blocks', itemId: 'block-heading', tabId: 'add' })
        );
    });

    it('should call onTabAdd when a tab add action is triggered', () => {
        const onTabAdd = jest.fn();

        render(buildConfig({ onTabAdd }));
        service().triggerTabAdd('properties');

        expect(onTabAdd).toHaveBeenCalledWith({ tabId: 'properties' });
    });

    it('should expose the variables input to the fields', () => {
        const variables = [new PropertyVariable({ id: 'customer', path: 'customer' })];

        render(buildConfig(), variables);

        expect(service().variables()).toBe(variables);
    });
});

describe('PropertiesMenuComponent · replacing the config', () => {
    const COLLAPSE = 'angular-components.properties-menu.list.collapse';
    const EXPAND = 'angular-components.properties-menu.list.expand';

    let fixture: ComponentFixture<PropertiesMenuComponent>;

    interface StatefulConfigOverrides {
        activeNodeId?: string;
        activeTabId?: string;
        contentExpanded?: boolean;
    }

    function buildNode(
        id: string,
        label: string,
        activeNodeId: string | undefined,
        children: PropertyTreeNode[] = []
    ): PropertyTreeNode {
        return new PropertyTreeNode({ active: id === activeNodeId, children, expanded: false, id, label });
    }

    function buildStatefulConfig({
        activeNodeId,
        activeTabId = 'properties',
        contentExpanded = true
    }: StatefulConfigOverrides = {}): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            activeTabId,
            prefix: 'app.properties-menu',
            tabs: [
                new PropertyTab({
                    groups: [
                        new PropertyGroup({
                            content: new PropertyFieldsContent({
                                fields: [new PropertyTextField({ id: 'text', label: 'Text' })]
                            }),
                            expanded: contentExpanded,
                            id: 'content',
                            label: 'Content'
                        }),
                        new PropertyGroup({
                            content: new PropertyTabsContent({
                                tabs: [
                                    new PropertyGroupTab({ id: 'top', label: 'Top' }),
                                    new PropertyGroupTab({ id: 'left', label: 'Left' })
                                ]
                            }),
                            expanded: true,
                            id: 'borders',
                            label: 'Borders'
                        })
                    ],
                    id: 'properties',
                    label: 'Properties'
                }),
                new PropertyTab({
                    groups: [
                        new PropertyGroup({
                            content: new PropertyTreeContent({
                                tree: new PropertyTreeConfig({
                                    nodes: [
                                        buildNode('page-1', 'Page 1', activeNodeId, [
                                            buildNode('section', 'Section', activeNodeId, [
                                                buildNode('totals', 'Totals', activeNodeId)
                                            ])
                                        ])
                                    ]
                                })
                            }),
                            id: 'structure-tree',
                            showHeader: false
                        })
                    ],
                    id: 'structure',
                    label: 'Structure'
                }),
                new PropertyTab({
                    groups: [
                        new PropertyGroup({
                            content: new PropertyListContent({
                                list: [
                                    new PropertyListItem({
                                        body: [new PropertySummaryRow({ label: 'Value', value: '3' })],
                                        id: 'total-pages',
                                        label: 'Total pages'
                                    })
                                ]
                            }),
                            id: 'variables-list',
                            showHeader: false
                        })
                    ],
                    id: 'variables',
                    label: 'Variables'
                })
            ]
        });
    }

    async function render(overrides: StatefulConfigOverrides = {}): Promise<void> {
        fixture = await renderComponent(PropertiesMenuComponent, { config: buildStatefulConfig(overrides) });
    }

    async function replaceConfig(overrides: StatefulConfigOverrides = {}): Promise<void> {
        fixture.componentRef.setInput('config', buildStatefulConfig(overrides));
        await settle(fixture);
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function pressKey(element: HTMLElement, key: string): Promise<void> {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
        await settle(fixture);
    }

    function byRole(role: string, name: string): HTMLElement {
        const found = queryAll(fixture, `[role="${role}"]`).find(element => element.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No ${role} named ${name}`);
        }

        return found;
    }

    function treeItemNames(): string[] {
        return textsOf(queryAll(fixture, '[role="treeitem"]'));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('keeps a group the user collapsed when the config is replaced', async () => {
        await render();
        await click(buttonByName(fixture, 'Content'));

        await replaceConfig();

        expect(buttonByName(fixture, 'Content').getAttribute('aria-expanded')).toBe('false');
    });

    it('opens a group the user collapsed when the config changes expanded to true', async () => {
        await render({ contentExpanded: true });
        await click(buttonByName(fixture, 'Content'));
        await replaceConfig({ contentExpanded: false });

        await replaceConfig({ contentExpanded: true });

        expect(buttonByName(fixture, 'Content').getAttribute('aria-expanded')).toBe('true');
    });

    it('keeps the tab the user opened when the config is replaced', async () => {
        await render();
        await click(byRole('tab', 'Structure'));

        await replaceConfig();

        expect(byRole('tab', 'Structure').getAttribute('aria-selected')).toBe('true');
        expect(treeItemNames()).toEqual(['Page 1']);
    });

    it('switches to the tab the config changes activeTabId to', async () => {
        await render();
        await click(byRole('tab', 'Structure'));

        await replaceConfig({ activeTabId: 'variables' });

        expect(byRole('tab', 'Variables').getAttribute('aria-selected')).toBe('true');
        expect(byRole('tab', 'Structure').getAttribute('aria-selected')).toBe('false');
    });

    it('keeps the tab of a group the user picked when the config is replaced', async () => {
        await render();
        await click(byRole('tab', 'Left'));

        await replaceConfig();

        expect(byRole('tab', 'Left').getAttribute('aria-selected')).toBe('true');
        expect(byRole('tab', 'Top').getAttribute('aria-selected')).toBe('false');
    });

    it('keeps a card the user expanded when the config is replaced', async () => {
        await render({ activeTabId: 'variables' });
        await click(buttonByName(fixture, EXPAND));

        await replaceConfig({ activeTabId: 'variables' });

        expect(buttonByName(fixture, COLLAPSE).getAttribute('aria-expanded')).toBe('true');
        expect(fixture.nativeElement.textContent).toContain('Value');
    });

    it('keeps a tree node the user expanded when the config is replaced', async () => {
        await render({ activeTabId: 'structure' });
        await pressKey(byRole('treeitem', 'Page 1'), 'ArrowRight');

        await replaceConfig({ activeTabId: 'structure' });

        expect(byRole('treeitem', 'Page 1').getAttribute('aria-expanded')).toBe('true');
        expect(treeItemNames()).toEqual(['Page 1', 'Section']);
    });

    it('keeps the tree node the user selected when the config is replaced', async () => {
        await render({ activeTabId: 'structure' });
        await click(byRole('treeitem', 'Page 1'));

        await replaceConfig({ activeTabId: 'structure' });

        expect(byRole('treeitem', 'Page 1').getAttribute('aria-selected')).toBe('true');
    });

    it('selects a nested node the config marks active and opens its ancestors', async () => {
        await render({ activeTabId: 'structure' });

        await replaceConfig({ activeNodeId: 'totals', activeTabId: 'structure' });

        expect(treeItemNames()).toEqual(['Page 1', 'Section', 'Totals']);
        expect(byRole('treeitem', 'Totals').getAttribute('aria-selected')).toBe('true');
    });
});

describe('PropertiesMenuComponent · tab label parameters', () => {
    let fixture: ComponentFixture<PropertiesMenuComponent>;

    function buildConfig(count: number): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            prefix: 'app.properties-menu',
            tabs: [
                new PropertyTab({ id: 'properties', label: 'Properties' }),
                new PropertyTab({ id: 'variables', label: 'inspector.variables', labelParameters: { count } })
            ]
        });
    }

    function tab(name: string): HTMLElement {
        const found = queryAll(fixture, '[role="tab"]').find(element => element.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No tab named ${name}`);
        }

        return found;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', { inspector: { variables: 'Variables ({{count}})' } });
        translate.use('en');
    });

    it('updates a tab label when only its parameters change, keeping the tab the user opened', async () => {
        fixture = await renderComponent(PropertiesMenuComponent, { config: buildConfig(2) });
        tab('Variables (2)').click();
        await settle(fixture);

        fixture.componentRef.setInput('config', buildConfig(3));
        await settle(fixture);

        expect(textsOf(queryAll(fixture, '[role="tab"]'))).toEqual(['Properties', 'Variables (3)']);
        expect(tab('Variables (3)').getAttribute('aria-selected')).toBe('true');
    });
});
