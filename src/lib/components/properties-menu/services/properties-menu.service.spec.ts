import { PropertyTextField } from '../models/fields/property-text-field.model';
import { PropertiesMenuConfig } from '../models/properties-menu-config.model';
import { PropertyTreeNodeToggle } from '../models/properties-menu-events.model';
import { PropertyGroup } from '../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyListContent,
    PropertyTreeContent
} from '../models/property-group-content.model';
import { PropertyListItem } from '../models/property-list-item.model';
import { PropertySummaryRow } from '../models/property-summary-row.model';
import { PropertyTab } from '../models/property-tab.model';
import { PropertyTreeConfig } from '../models/property-tree-config.model';
import { PropertyTreeNode } from '../models/property-tree-node.model';
import { PropertyVariable } from '../models/property-variable.model';
import { PropertiesMenuService } from './properties-menu.service';

function buildConfig(): PropertiesMenuConfig {
    return new PropertiesMenuConfig({
        prefix: 'app.properties-menu',
        activeTabId: 'properties',
        tabs: [
            new PropertyTab({
                id: 'properties',
                label: 'Propiedades',
                groups: [
                    new PropertyGroup({
                        id: 'content',
                        label: 'Contenido',
                        expanded: true,
                        content: new PropertyFieldsContent({
                            fields: [new PropertyTextField({ id: 'text', value: 'FACTURA' })]
                        })
                    })
                ]
            }),
            new PropertyTab({ id: 'page', label: 'Página', groups: [] }),
            new PropertyTab({
                id: 'structure',
                label: 'Estructura',
                groups: [
                    new PropertyGroup({
                        id: 'structure-tree',
                        showHeader: false,
                        content: new PropertyTreeContent({
                            tree: new PropertyTreeConfig({
                                nodes: [
                                    new PropertyTreeNode({
                                        id: 'page-1',
                                        label: 'Página 1',
                                        children: [new PropertyTreeNode({ id: 'header', label: 'Encabezado' })]
                                    })
                                ]
                            })
                        })
                    })
                ]
            }),
            new PropertyTab({
                id: 'add',
                label: 'Añadir',
                groups: [
                    new PropertyGroup({
                        id: 'simple-blocks',
                        showHeader: false,
                        content: new PropertyListContent({
                            list: [
                                new PropertyListItem({ id: 'block-heading', label: 'Encabezado' }),
                                new PropertyListItem({ disabled: true, id: 'block-locked', label: 'Bloqueado' })
                            ]
                        })
                    })
                ]
            })
        ]
    });
}

describe('PropertiesMenuService', () => {
    let service: PropertiesMenuService;

    beforeEach(() => {
        service = new PropertiesMenuService();
    });

    it('starts from an empty config', () => {
        expect(service.config().tabs).toEqual([]);
    });

    it('takes the config and the active tab from it', () => {
        service.setConfig(buildConfig());

        expect(service.activeTabId()).toBe('properties');
        expect(service.config().tabs).toHaveLength(4);
    });

    it('selects no tree node when none is marked active', () => {
        service.setConfig(buildConfig());

        expect(service.selectedTreeNodeId()).toBeNull();
    });

    it('selects the tree node the config marks active', () => {
        service.setConfig(
            new PropertiesMenuConfig({
                prefix: 'app.properties-menu',
                tabs: [
                    new PropertyTab({
                        id: 'structure',
                        groups: [
                            new PropertyGroup({
                                id: 'structure-tree',
                                showHeader: false,
                                content: new PropertyTreeContent({
                                    tree: new PropertyTreeConfig({
                                        nodes: [
                                            new PropertyTreeNode({
                                                id: 'page-1',
                                                children: [new PropertyTreeNode({ id: 'header', active: true })]
                                            })
                                        ]
                                    })
                                })
                            })
                        ]
                    })
                ]
            })
        );

        expect(service.selectedTreeNodeId()).toBe('header');
    });

    describe('setActiveTab', () => {
        it('changes the active tab and calls the hook', () => {
            service.setConfig(buildConfig());

            const onActiveTabChange = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onActiveTabChange }));

            service.setActiveTab('page');

            expect(service.activeTabId()).toBe('page');
            expect(onActiveTabChange).toHaveBeenCalledWith('page');
        });

        it('ignores an unknown tab id', () => {
            service.setConfig(buildConfig());

            service.setActiveTab('unknown');

            expect(service.activeTabId()).toBe('properties');
        });
    });

    describe('toggleGroup', () => {
        it('flips the expanded state and calls the hook', () => {
            service.setConfig(buildConfig());

            const onGroupToggle = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onGroupToggle }));

            service.toggleGroup('properties', 'content');

            const tab = service.config().tabs[0];

            expect(tab.groups[0].expanded).toBe(false);
            expect(onGroupToggle).toHaveBeenCalledWith({ expanded: false, groupId: 'content', tabId: 'properties' });
        });

        it('ignores a group without a header', () => {
            service.setConfig(buildConfig());

            const onGroupToggle = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onGroupToggle }));

            service.toggleGroup('structure', 'structure-tree');

            expect(onGroupToggle).not.toHaveBeenCalled();
        });
    });

    describe('updateFieldValue', () => {
        it('updates the field value in a new config and calls the hook', () => {
            service.setConfig(buildConfig());

            const onFieldValueChange = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onFieldValueChange }));

            const previousConfig = service.config();

            service.updateFieldValue('text', 'NUEVO TEXTO');

            expect(service.config()).not.toBe(previousConfig);
            expect(service.getField('text')?.value).toBe('NUEVO TEXTO');
            expect(onFieldValueChange).toHaveBeenCalledWith({
                fieldId: 'text',
                previousValue: 'FACTURA',
                value: 'NUEVO TEXTO'
            });
        });
    });

    describe('applyVariableSelection', () => {
        it('updates the field value and calls both hooks', () => {
            service.setConfig(buildConfig());

            const onFieldValueChange = jest.fn();
            const onVariableSelect = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onFieldValueChange }));
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onVariableSelect }));

            const variable = new PropertyVariable({ id: 'customer-name', path: 'customer.name' });

            service.applyVariableSelection('text', variable, 'FACTURA {{ customer.name }}');

            expect(service.getField('text')?.value).toBe('FACTURA {{ customer.name }}');
            expect(onFieldValueChange).toHaveBeenCalled();
            expect(onVariableSelect).toHaveBeenCalledWith({
                expression: '{{ customer.name }}',
                fieldId: 'text',
                variable
            });
        });
    });

    describe('getField', () => {
        it('returns undefined for an unknown field', () => {
            service.setConfig(buildConfig());

            expect(service.getField('missing')).toBeUndefined();
        });
    });

    describe('selectTreeNode', () => {
        it('selects the node and calls the hook', () => {
            service.setConfig(buildConfig());

            const onTreeNodeSelect = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onTreeNodeSelect }));

            service.selectTreeNode('structure', 'structure-tree', 'header');

            expect(service.selectedTreeNodeId()).toBe('header');
            expect(onTreeNodeSelect).toHaveBeenCalledWith({
                groupId: 'structure-tree',
                node: service.getTreeNode('structure', 'structure-tree', 'header'),
                nodeId: 'header',
                tabId: 'structure'
            });
        });

        it('ignores an unknown node id', () => {
            service.setConfig(buildConfig());

            service.selectTreeNode('structure', 'structure-tree', 'missing');

            expect(service.selectedTreeNodeId()).toBeNull();
        });
    });

    describe('toggleTreeNode', () => {
        it('flips the expanded state of a nested node in a new config', () => {
            service.setConfig(buildConfig());

            const previousConfig = service.config();

            service.toggleTreeNode('structure', 'structure-tree', 'header');

            expect(service.config()).not.toBe(previousConfig);
            expect(service.getTreeNode('structure', 'structure-tree', 'header')?.expanded).toBe(false);
        });

        it('calls the hook with the resulting expanded state', () => {
            service.setConfig(buildConfig());

            const onTreeNodeToggle = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onTreeNodeToggle }));

            service.toggleTreeNode('structure', 'structure-tree', 'header');

            expect(onTreeNodeToggle).toHaveBeenCalledWith({
                expanded: false,
                groupId: 'structure-tree',
                nodeId: 'header',
                tabId: 'structure'
            });
        });
    });

    describe('triggerTreeAddBlock', () => {
        it('calls the hook with the tab and group ids', () => {
            service.setConfig(buildConfig());

            const onTreeAddBlock = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onTreeAddBlock }));

            service.triggerTreeAddBlock('structure', 'structure-tree');

            expect(onTreeAddBlock).toHaveBeenCalledWith({ groupId: 'structure-tree', tabId: 'structure' });
        });
    });

    describe('getTreeNode', () => {
        it('finds a nested node by id', () => {
            service.setConfig(buildConfig());

            expect(service.getTreeNode('structure', 'structure-tree', 'header')?.label).toBe('Encabezado');
        });

        it('returns undefined for an unknown node', () => {
            service.setConfig(buildConfig());

            expect(service.getTreeNode('structure', 'structure-tree', 'missing')).toBeUndefined();
        });
    });

    describe('selectListItem', () => {
        it('calls the hook with the selected item', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemSelect }));

            service.selectListItem('add', 'simple-blocks', 'block-heading');

            expect(onListItemSelect).toHaveBeenCalledWith({
                groupId: 'simple-blocks',
                item: service.getListItem('add', 'simple-blocks', 'block-heading'),
                itemId: 'block-heading',
                tabId: 'add'
            });
        });

        it('ignores a disabled item', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemSelect }));

            service.selectListItem('add', 'simple-blocks', 'block-locked');

            expect(onListItemSelect).not.toHaveBeenCalled();
        });

        it('ignores an unknown item id', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemSelect }));

            service.selectListItem('add', 'simple-blocks', 'missing');

            expect(onListItemSelect).not.toHaveBeenCalled();
        });
    });

    describe('getListItem', () => {
        it('finds an item by id', () => {
            service.setConfig(buildConfig());

            expect(service.getListItem('add', 'simple-blocks', 'block-heading')?.label).toBe('Encabezado');
        });

        it('returns undefined for an unknown item', () => {
            service.setConfig(buildConfig());

            expect(service.getListItem('add', 'simple-blocks', 'missing')).toBeUndefined();
        });
    });
});

describe('PropertiesMenuService · expandable list items', () => {
    let service: PropertiesMenuService;

    const EXPANDABLE_ITEM = { body: [new PropertySummaryRow({ label: 'Valor' })], id: 'total_pages' };

    function setUpList(items: PropertyListItem[]): void {
        service.setConfig(
            new PropertiesMenuConfig({
                prefix: 'app.properties-menu',
                tabs: [
                    new PropertyTab({
                        id: 'variables',
                        groups: [
                            new PropertyGroup({
                                id: 'variables-list',
                                showHeader: false,
                                content: new PropertyListContent({ list: items })
                            })
                        ]
                    })
                ]
            })
        );
    }

    beforeEach(() => {
        service = new PropertiesMenuService();
    });

    it('flips the expanded flag and reports it', () => {
        setUpList([new PropertyListItem(EXPANDABLE_ITEM)]);

        const toggles: boolean[] = [];
        service.setConfig(
            new PropertiesMenuConfig({ ...service.config(), onListItemToggle: event => toggles.push(event.expanded) })
        );

        service.toggleListItem('variables', 'variables-list', 'total_pages');
        expect(service.getListItem('variables', 'variables-list', 'total_pages')?.expanded).toBe(true);

        service.toggleListItem('variables', 'variables-list', 'total_pages');
        expect(service.getListItem('variables', 'variables-list', 'total_pages')?.expanded).toBe(false);

        expect(toggles).toEqual([true, false]);
    });

    it('ignores a toggle on an item without a body', () => {
        setUpList([new PropertyListItem({ id: 'plain' })]);

        const toggleSpy = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemToggle: toggleSpy }));

        service.toggleListItem('variables', 'variables-list', 'plain');

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('ignores a toggle on a disabled item', () => {
        setUpList([new PropertyListItem({ ...EXPANDABLE_ITEM, disabled: true })]);

        const toggleSpy = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemToggle: toggleSpy }));

        service.toggleListItem('variables', 'variables-list', 'total_pages');

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('reports a removal only for a removable item', () => {
        setUpList([new PropertyListItem({ ...EXPANDABLE_ITEM, removable: true })]);

        const removeSpy = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemRemove: removeSpy }));

        service.removeListItem('variables', 'variables-list', 'total_pages');

        expect(removeSpy).toHaveBeenCalledWith({
            groupId: 'variables-list',
            itemId: 'total_pages',
            tabId: 'variables'
        });
    });

    it('ignores a removal on a non-removable item', () => {
        setUpList([new PropertyListItem(EXPANDABLE_ITEM)]);

        const removeSpy = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ ...service.config(), onListItemRemove: removeSpy }));

        service.removeListItem('variables', 'variables-list', 'total_pages');

        expect(removeSpy).not.toHaveBeenCalled();
    });

    it('leaves the other items untouched when one is expanded', () => {
        setUpList([new PropertyListItem(EXPANDABLE_ITEM), new PropertyListItem({ ...EXPANDABLE_ITEM, id: 'other' })]);

        service.toggleListItem('variables', 'variables-list', 'total_pages');

        expect(service.getListItem('variables', 'variables-list', 'other')?.expanded).toBe(false);
    });
});

describe('PropertiesMenuService · replacing the config', () => {
    let service: PropertiesMenuService;

    interface ReplacementOverrides {
        activeNodeId?: string;
        activeTabId?: string;
        extraGroups?: PropertyGroup[];
        onTreeNodeToggle?: (event: PropertyTreeNodeToggle) => void;
        treeNodes?: PropertyTreeNode[];
    }

    function buildTree(activeNodeId?: string): PropertyTreeNode[] {
        return [
            new PropertyTreeNode({
                children: [
                    new PropertyTreeNode({ active: activeNodeId === 'header', expanded: false, id: 'header' }),
                    new PropertyTreeNode({ active: activeNodeId === 'footer', expanded: false, id: 'footer' })
                ],
                expanded: false,
                id: 'page-1'
            })
        ];
    }

    function buildReplacement({
        activeNodeId,
        activeTabId,
        extraGroups = [],
        onTreeNodeToggle,
        treeNodes = buildTree(activeNodeId)
    }: ReplacementOverrides = {}): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            activeTabId,
            onTreeNodeToggle,
            prefix: 'app.properties-menu',
            tabs: [
                new PropertyTab({
                    groups: [new PropertyGroup({ expanded: true, id: 'content' }), ...extraGroups],
                    id: 'properties'
                }),
                new PropertyTab({
                    groups: [
                        new PropertyGroup({
                            content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ nodes: treeNodes }) }),
                            id: 'structure-tree',
                            showHeader: false
                        })
                    ],
                    id: 'structure'
                })
            ]
        });
    }

    beforeEach(() => {
        service = new PropertiesMenuService();
    });

    it('gives a group that is new in the config the expanded value it carries', () => {
        service.setConfig(buildReplacement());
        service.toggleGroup('properties', 'content');

        service.setConfig(buildReplacement({ extraGroups: [new PropertyGroup({ expanded: true, id: 'spacing' })] }));

        expect(service.getGroup('properties', 'content')?.expanded).toBe(false);
        expect(service.getGroup('properties', 'spacing')?.expanded).toBe(true);
    });

    it('falls back to the tab of the config when the tab the user opened is gone', () => {
        service.setConfig(buildReplacement());
        service.setActiveTab('structure');

        service.setConfig(
            new PropertiesMenuConfig({
                ...buildReplacement(),
                tabs: buildReplacement().tabs.filter(tab => tab.id !== 'structure')
            })
        );

        expect(service.activeTabId()).toBe('properties');
    });

    it('falls back to the node the config marks active when the node the user selected is gone', () => {
        service.setConfig(buildReplacement({ activeNodeId: 'header' }));
        service.selectTreeNode('structure', 'structure-tree', 'footer');

        service.setConfig(buildReplacement({ treeNodes: [new PropertyTreeNode({ active: true, id: 'header' })] }));

        expect(service.selectedTreeNodeId()).toBe('header');
    });

    it('clears the selection when the config stops marking a node active', () => {
        service.setConfig(buildReplacement({ activeNodeId: 'header' }));

        service.setConfig(buildReplacement());

        expect(service.selectedTreeNodeId()).toBeNull();
    });

    it('opens the ancestors of the node the config selects without reporting them as toggles', () => {
        const onTreeNodeToggle = jest.fn();
        service.setConfig(buildReplacement({ onTreeNodeToggle }));

        service.setConfig(buildReplacement({ activeNodeId: 'footer', onTreeNodeToggle }));

        expect(service.getTreeNode('structure', 'structure-tree', 'page-1')?.expanded).toBe(true);
        expect(service.getTreeNode('structure', 'structure-tree', 'footer')?.expanded).toBe(false);
        expect(onTreeNodeToggle).not.toHaveBeenCalled();
    });

    it('keeps an ancestor the user closed after the reveal while the config selects the same node', () => {
        service.setConfig(buildReplacement({ activeNodeId: 'footer' }));
        service.toggleTreeNode('structure', 'structure-tree', 'page-1');

        service.setConfig(buildReplacement({ activeNodeId: 'footer' }));

        expect(service.getTreeNode('structure', 'structure-tree', 'page-1')?.expanded).toBe(false);
    });
});
