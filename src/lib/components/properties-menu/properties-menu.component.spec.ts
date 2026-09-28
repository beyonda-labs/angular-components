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

    async function click(target: HTMLElement): Promise<void> {
        target.click();
        await settle(fixture);
    }

    function byRole(role: string, name: string): HTMLElement {
        const found = queryAll(fixture, `[role="${role}"]`).find(candidate => candidate.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No ${role} named ${name}`);
        }

        return found;
    }

    function field(name: string): HTMLInputElement {
        const label = queryAll<HTMLLabelElement>(fixture, 'label').find(
            candidate => candidate.textContent?.trim() === name
        );

        if (!label?.control) {
            throw new Error(`No field named ${name}`);
        }

        return label.control as HTMLInputElement;
    }

    function tabNames(): string[] {
        return textsOf(queryAll(fixture, '[role="tab"]'));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertiesMenuComponent);
        element = fixture.nativeElement;
    });

    it('renders the header title and subtitle', () => {
        render(buildConfig());

        expect(element.textContent).toContain('Title');
        expect(element.textContent).toContain('Block: heading');
    });

    it('shows the default title from the prefix', () => {
        render(buildConfig({ title: undefined }));

        expect(element.textContent).toContain('app.properties-menu.title');
    });

    it('hides the header when embedded', () => {
        render(buildConfig({ embedded: true }));

        expect(element.textContent).not.toContain('Title');
    });

    it('shows the close button only when onClose is configured', () => {
        const onClose = jest.fn();

        render(buildConfig());
        expect(closeButton()).toBeNull();

        render(buildConfig({ onClose }));
        closeButton()?.click();

        expect(onClose).toHaveBeenCalled();
    });

    it('renders the tab strip and the fields of the configured active tab', () => {
        render(buildConfig());

        expect(tabNames()).toEqual(['Properties', 'Page', 'Structure', 'Add']);
        expect(byRole('tab', 'Properties').getAttribute('aria-selected')).toBe('true');
        expect(field('Text').value).toBe('INVOICE');
    });

    it('hides the tab strip with a single visible tab', () => {
        render(buildConfig({ tabs: [new PropertyTab({ groups: [], id: 'only' })] }));

        expect(tabNames()).toEqual([]);
    });

    it('follows a replaced config', () => {
        render(buildConfig());
        render(buildConfig({ activeTabId: 'page', subtitle: 'Block: page' }));

        expect(element.textContent).toContain('Block: page');
        expect(element.textContent).not.toContain('Content');
    });

    it('calls onActiveTabChange when another tab is opened', async () => {
        const onActiveTabChange = jest.fn();

        render(buildConfig({ onActiveTabChange }));
        await click(byRole('tab', 'Page'));

        expect(onActiveTabChange).toHaveBeenCalledWith('page');
    });

    it('calls onFieldValueChange when a field is typed into', async () => {
        const onFieldValueChange = jest.fn();

        render(buildConfig({ onFieldValueChange }));
        field('Text').value = 'NEW TEXT';
        field('Text').dispatchEvent(new Event('input'));
        await settle(fixture);

        expect(onFieldValueChange).toHaveBeenCalledWith({
            fieldId: 'text',
            previousValue: 'INVOICE',
            value: 'NEW TEXT'
        });
    });

    it('calls onGroupToggle when a group is collapsed', async () => {
        const onGroupToggle = jest.fn();

        render(buildConfig({ onGroupToggle }));
        await click(buttonByName(fixture, 'Content'));

        expect(onGroupToggle).toHaveBeenCalledWith({ expanded: false, groupId: 'content', tabId: 'properties' });
    });

    it('calls onTreeNodeSelect when a tree node is selected', async () => {
        const onTreeNodeSelect = jest.fn();

        render(buildConfig({ onTreeNodeSelect }));
        await click(byRole('tab', 'Structure'));
        await click(byRole('treeitem', 'Page 1'));

        expect(onTreeNodeSelect).toHaveBeenCalledWith(
            expect.objectContaining({ groupId: 'structure-tree', nodeId: 'page-1', tabId: 'structure' })
        );
    });

    it('calls onListItemSelect when a list item is selected', async () => {
        const onListItemSelect = jest.fn();

        render(buildConfig({ onListItemSelect }));
        await click(byRole('tab', 'Add'));
        await click(byRole('button', 'Heading'));

        expect(onListItemSelect).toHaveBeenCalledWith(
            expect.objectContaining({ groupId: 'simple-blocks', itemId: 'block-heading', tabId: 'add' })
        );
    });

    it('calls onTabAdd when the add button of a tab is clicked', async () => {
        const onTabAdd = jest.fn();

        render(
            buildConfig({
                onTabAdd,
                tabs: [new PropertyTab({ addLabel: 'Add group', groups: [], id: 'properties' })]
            })
        );
        await click(buttonByName(fixture, 'Add group'));

        expect(onTabAdd).toHaveBeenCalledWith({ tabId: 'properties' });
    });

    it('offers the variables input to the fields that accept variables', async () => {
        render(buildConfig(), [new PropertyVariable({ id: 'customer', label: 'Customer', path: 'customer' })]);
        await click(buttonByName(fixture, 'angular-components.properties-menu.text-field.insert-variable'));

        expect(
            queryAll(document.body, '[role="option"]').some(option => option.textContent?.includes('Customer'))
        ).toBe(true);
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
