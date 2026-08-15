import { PropertyTextField } from '../models/fields/property-text-field.model';
import { PropertiesMenuConfig } from '../models/properties-menu-config.model';
import { PropertyGroup } from '../models/property-group.model';
import { PropertyFieldsContent, PropertyListContent, PropertyTreeContent } from '../models/property-group-content.model';
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
                        content: new PropertyFieldsContent({ fields: [new PropertyTextField({ id: 'text', value: 'FACTURA' })] })
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

    it('should default to an empty config', () => {
        expect(service.config().tabs).toEqual([]);
    });

    it('should set the config and the active tab from it', () => {
        service.setConfig(buildConfig());

        expect(service.activeTabId()).toBe('properties');
        expect(service.config().tabs).toHaveLength(4);
    });

    it('should default selectedTreeNodeId to null when no tree node is marked active', () => {
        service.setConfig(buildConfig());

        expect(service.selectedTreeNodeId()).toBeNull();
    });

    it('should initialize selectedTreeNodeId from a node marked active in the config', () => {
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
        it('should change the active tab and notify the hook', () => {
            service.setConfig(buildConfig());

            const onActiveTabChange = jest.fn();
            service.onActiveTabChange = onActiveTabChange;

            service.setActiveTab('page');

            expect(service.activeTabId()).toBe('page');
            expect(onActiveTabChange).toHaveBeenCalledWith('page');
        });

        it('should ignore unknown tab ids', () => {
            service.setConfig(buildConfig());

            service.setActiveTab('unknown');

            expect(service.activeTabId()).toBe('properties');
        });
    });

    describe('toggleGroup', () => {
        it('should flip the expanded state and notify the hook', () => {
            service.setConfig(buildConfig());

            const onGroupToggle = jest.fn();
            service.onGroupToggle = onGroupToggle;

            service.toggleGroup('properties', 'content');

            const tab = service.config().tabs[0];

            expect(tab.groups[0].expanded).toBe(false);
            expect(onGroupToggle).toHaveBeenCalledWith({ expanded: false, groupId: 'content', tabId: 'properties' });
        });

        it('should ignore groups without a header', () => {
            service.setConfig(buildConfig());

            const onGroupToggle = jest.fn();
            service.onGroupToggle = onGroupToggle;

            service.toggleGroup('structure', 'structure-tree');

            expect(onGroupToggle).not.toHaveBeenCalled();
        });
    });

    describe('updateFieldValue', () => {
        it('should update the field value immutably and notify the hook', () => {
            service.setConfig(buildConfig());

            const onFieldValueChange = jest.fn();
            service.onFieldValueChange = onFieldValueChange;

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
        it('should update the field value and notify both hooks', () => {
            service.setConfig(buildConfig());

            const onFieldValueChange = jest.fn();
            const onVariableSelected = jest.fn();
            service.onFieldValueChange = onFieldValueChange;
            service.onVariableSelected = onVariableSelected;

            const variable = new PropertyVariable({ id: 'customer-name', path: 'customer.name' });

            service.applyVariableSelection('text', variable, 'FACTURA {{ customer.name }}');

            expect(service.getField('text')?.value).toBe('FACTURA {{ customer.name }}');
            expect(onFieldValueChange).toHaveBeenCalled();
            expect(onVariableSelected).toHaveBeenCalledWith({
                expression: '{{ customer.name }}',
                fieldId: 'text',
                variable
            });
        });
    });

    describe('getField', () => {
        it('should return undefined for an unknown field', () => {
            service.setConfig(buildConfig());

            expect(service.getField('missing')).toBeUndefined();
        });
    });

    describe('selectTreeNode', () => {
        it('should select the node and notify the hook', () => {
            service.setConfig(buildConfig());

            const onTreeNodeSelect = jest.fn();
            service.onTreeNodeSelect = onTreeNodeSelect;

            service.selectTreeNode('structure', 'structure-tree', 'header');

            expect(service.selectedTreeNodeId()).toBe('header');
            expect(onTreeNodeSelect).toHaveBeenCalledWith({
                groupId: 'structure-tree',
                node: service.getTreeNode('structure', 'structure-tree', 'header'),
                nodeId: 'header',
                tabId: 'structure'
            });
        });

        it('should ignore unknown node ids', () => {
            service.setConfig(buildConfig());

            service.selectTreeNode('structure', 'structure-tree', 'missing');

            expect(service.selectedTreeNodeId()).toBeNull();
        });
    });

    describe('toggleTreeNode', () => {
        it('should flip the expanded state of a nested node immutably', () => {
            service.setConfig(buildConfig());

            const previousConfig = service.config();

            service.toggleTreeNode('structure', 'structure-tree', 'header');

            expect(service.config()).not.toBe(previousConfig);
            expect(service.getTreeNode('structure', 'structure-tree', 'header')?.expanded).toBe(false);
        });

        it('should notify the hook with the resulting expanded state', () => {
            service.setConfig(buildConfig());

            const onTreeNodeToggle = jest.fn();
            service.onTreeNodeToggle = onTreeNodeToggle;

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
        it('should notify the hook with the tab and group ids', () => {
            service.setConfig(buildConfig());

            const onTreeAddBlock = jest.fn();
            service.onTreeAddBlock = onTreeAddBlock;

            service.triggerTreeAddBlock('structure', 'structure-tree');

            expect(onTreeAddBlock).toHaveBeenCalledWith({ groupId: 'structure-tree', tabId: 'structure' });
        });
    });

    describe('getTreeNode', () => {
        it('should find a nested node by id', () => {
            service.setConfig(buildConfig());

            expect(service.getTreeNode('structure', 'structure-tree', 'header')?.label).toBe('Encabezado');
        });

        it('should return undefined for an unknown node', () => {
            service.setConfig(buildConfig());

            expect(service.getTreeNode('structure', 'structure-tree', 'missing')).toBeUndefined();
        });
    });

    describe('selectListItem', () => {
        it('should notify the hook with the selected item', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.onListItemSelect = onListItemSelect;

            service.selectListItem('add', 'simple-blocks', 'block-heading');

            expect(onListItemSelect).toHaveBeenCalledWith({
                groupId: 'simple-blocks',
                item: service.getListItem('add', 'simple-blocks', 'block-heading'),
                itemId: 'block-heading',
                tabId: 'add'
            });
        });

        it('should ignore disabled items', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.onListItemSelect = onListItemSelect;

            service.selectListItem('add', 'simple-blocks', 'block-locked');

            expect(onListItemSelect).not.toHaveBeenCalled();
        });

        it('should ignore unknown item ids', () => {
            service.setConfig(buildConfig());

            const onListItemSelect = jest.fn();
            service.onListItemSelect = onListItemSelect;

            service.selectListItem('add', 'simple-blocks', 'missing');

            expect(onListItemSelect).not.toHaveBeenCalled();
        });
    });

    describe('getListItem', () => {
        it('should find an item by id', () => {
            service.setConfig(buildConfig());

            expect(service.getListItem('add', 'simple-blocks', 'block-heading')?.label).toBe('Encabezado');
        });

        it('should return undefined for an unknown item', () => {
            service.setConfig(buildConfig());

            expect(service.getListItem('add', 'simple-blocks', 'missing')).toBeUndefined();
        });
    });
});

describe('PropertiesMenuService · items de lista desplegables', () => {
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
        service.onListItemToggle = event => toggles.push(event.expanded);

        service.toggleListItem('variables', 'variables-list', 'total_pages');
        expect(service.getListItem('variables', 'variables-list', 'total_pages')?.expanded).toBe(true);

        service.toggleListItem('variables', 'variables-list', 'total_pages');
        expect(service.getListItem('variables', 'variables-list', 'total_pages')?.expanded).toBe(false);

        expect(toggles).toEqual([true, false]);
    });

    it('ignores a toggle on an item without a body', () => {
        setUpList([new PropertyListItem({ id: 'plain' })]);

        const toggleSpy = jest.fn();
        service.onListItemToggle = toggleSpy;

        service.toggleListItem('variables', 'variables-list', 'plain');

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('ignores a toggle on a disabled item', () => {
        setUpList([new PropertyListItem({ ...EXPANDABLE_ITEM, disabled: true })]);

        const toggleSpy = jest.fn();
        service.onListItemToggle = toggleSpy;

        service.toggleListItem('variables', 'variables-list', 'total_pages');

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('reports a removal only for a removable item', () => {
        setUpList([new PropertyListItem({ ...EXPANDABLE_ITEM, removable: true })]);

        const removeSpy = jest.fn();
        service.onListItemRemove = removeSpy;

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
        service.onListItemRemove = removeSpy;

        service.removeListItem('variables', 'variables-list', 'total_pages');

        expect(removeSpy).not.toHaveBeenCalled();
    });

    it('leaves the other items untouched when one is expanded', () => {
        setUpList([new PropertyListItem(EXPANDABLE_ITEM), new PropertyListItem({ ...EXPANDABLE_ITEM, id: 'other' })]);

        service.toggleListItem('variables', 'variables-list', 'total_pages');

        expect(service.getListItem('variables', 'variables-list', 'other')?.expanded).toBe(false);
    });
});
