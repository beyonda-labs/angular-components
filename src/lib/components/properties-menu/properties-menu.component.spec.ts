import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTextField } from './models/fields/property-text-field.model';
import { PropertiesMenuConfig } from './models/properties-menu-config.model';
import { PropertyGroup } from './models/property-group.model';
import { PropertyFieldsContent, PropertyListContent, PropertyTreeContent } from './models/property-group-content.model';
import { PropertyListItem } from './models/property-list-item.model';
import { PropertyTab } from './models/property-tab.model';
import { PropertyTreeConfig } from './models/property-tree-config.model';
import { PropertyTreeNode } from './models/property-tree-node.model';
import { PropertyVariable } from './models/property-variable.model';
import { PropertiesMenuComponent } from './properties-menu.component';

function buildConfig(): PropertiesMenuConfig {
    return new PropertiesMenuConfig({
        prefix: 'app.properties-menu',
        activeTabId: 'properties',
        icon: undefined,
        subtitle: 'Bloque: heading',
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
                            fields: [new PropertyTextField({ id: 'text', label: 'Texto', value: 'FACTURA', acceptsVariable: true })]
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
                            tree: new PropertyTreeConfig({ nodes: [new PropertyTreeNode({ id: 'page-1', label: 'Página 1' })] })
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
                        content: new PropertyListContent({ list: [new PropertyListItem({ id: 'block-heading', label: 'Encabezado' })] })
                    })
                ]
            })
        ],
        title: 'Título'
    });
}

describe('PropertiesMenuComponent', () => {
    let component: PropertiesMenuComponent;
    let fixture: ComponentFixture<PropertiesMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertiesMenuComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertiesMenuComponent);
        component = fixture.componentInstance;
        component.config = buildConfig();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the header title and subtitle', () => {
        const title = fixture.nativeElement.querySelector('.bey-properties-menu-header-title');
        const subtitle = fixture.nativeElement.querySelector('.bey-properties-menu-header-subtitle');

        expect(title.textContent).toContain('Título');
        expect(subtitle.textContent).toContain('Bloque: heading');
    });

    it('should hide the header and the card chrome when embedded is true', () => {
        component.config = new PropertiesMenuConfig({ prefix: 'app.properties-menu', embedded: true });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-properties-menu-header')).toBeFalsy();
        expect(fixture.nativeElement.querySelector('.bey-properties-menu-embedded')).toBeTruthy();
    });

    it('should default the active tab to the configured activeTabId', () => {
        expect(component.activeTab?.id).toBe('properties');
    });

    it('should emit activeTabChange when the active tab changes', () => {
        const activeTabChangeSpy = jest.spyOn(component.activeTabChange, 'emit');

        component['propertiesMenuService'].setActiveTab('page');

        expect(activeTabChangeSpy).toHaveBeenCalledWith('page');
    });

    it('should emit fieldValueChange when a field value is updated', () => {
        const fieldValueChangeSpy = jest.spyOn(component.fieldValueChange, 'emit');

        component['propertiesMenuService'].updateFieldValue('text', 'NUEVO TEXTO');

        expect(fieldValueChangeSpy).toHaveBeenCalledWith({
            fieldId: 'text',
            previousValue: 'FACTURA',
            value: 'NUEVO TEXTO'
        });
    });

    it('should emit groupToggle when a group is expanded or collapsed', () => {
        const groupToggleSpy = jest.spyOn(component.groupToggle, 'emit');

        component['propertiesMenuService'].toggleGroup('properties', 'content');

        expect(groupToggleSpy).toHaveBeenCalledWith({ expanded: false, groupId: 'content', tabId: 'properties' });
    });

    it('should emit treeNodeSelect when a tree node is selected', () => {
        const treeNodeSelectSpy = jest.spyOn(component.treeNodeSelect, 'emit');

        component['propertiesMenuService'].selectTreeNode('structure', 'structure-tree', 'page-1');

        expect(treeNodeSelectSpy).toHaveBeenCalledWith({
            groupId: 'structure-tree',
            node: component['propertiesMenuService'].getTreeNode('structure', 'structure-tree', 'page-1'),
            nodeId: 'page-1',
            tabId: 'structure'
        });
    });

    it('should emit treeAddBlock when a tree add-block action is triggered', () => {
        const treeAddBlockSpy = jest.spyOn(component.treeAddBlock, 'emit');

        component['propertiesMenuService'].triggerTreeAddBlock('structure', 'structure-tree');

        expect(treeAddBlockSpy).toHaveBeenCalledWith({ groupId: 'structure-tree', tabId: 'structure' });
    });

    it('should emit listItemSelect when a list item is selected', () => {
        const listItemSelectSpy = jest.spyOn(component.listItemSelect, 'emit');

        component['propertiesMenuService'].selectListItem('add', 'simple-blocks', 'block-heading');

        expect(listItemSelectSpy).toHaveBeenCalledWith({
            groupId: 'simple-blocks',
            item: component['propertiesMenuService'].getListItem('add', 'simple-blocks', 'block-heading'),
            itemId: 'block-heading',
            tabId: 'add'
        });
    });

    it('should emit tabAddRequested when a tab add action is triggered', () => {
        const tabAddRequestedSpy = jest.spyOn(component.tabAddRequested, 'emit');

        component['propertiesMenuService'].triggerTabAdd('properties');

        expect(tabAddRequestedSpy).toHaveBeenCalledWith({ tabId: 'properties' });
    });

    it('should emit closed when the header close action is triggered', () => {
        const closedSpy = jest.spyOn(component.closed, 'emit');

        component.onClose();

        expect(closedSpy).toHaveBeenCalled();
    });

    describe('variables API', () => {
        it('should set variables imperatively and expose them through getVariables', () => {
            component.setVariables([{ id: 'customer', path: 'customer' }]);

            expect(component.getVariables()[0]).toBeInstanceOf(PropertyVariable);
        });

        it('should set variables through the input setter', () => {
            component.variables = [{ id: 'invoice', path: 'invoice' }];

            expect(component.getVariables()).toHaveLength(1);
        });

        it('should clear variables', () => {
            component.setVariables([{ id: 'customer', path: 'customer' }]);
            component.clearVariables();

            expect(component.getVariables()).toEqual([]);
        });
    });
});
