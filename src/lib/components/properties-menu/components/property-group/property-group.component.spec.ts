import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyGroup } from '../../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyListContent,
    PropertyTreeContent
} from '../../models/property-group-content.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertyTreeConfig } from '../../models/property-tree-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { PropertyGroupComponent } from './property-group.component';

describe('PropertyGroupComponent', () => {
    let component: PropertyGroupComponent;
    let fixture: ComponentFixture<PropertyGroupComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const header = (): HTMLButtonElement | null => fixture.nativeElement.querySelector('[aria-expanded]');

    const buttons = (text: string): HTMLButtonElement[] =>
        queryAll<HTMLButtonElement>(fixture, 'button').filter(element => element.textContent?.trim() === text);

    const button = (text: string): HTMLButtonElement | null => queryButton(fixture, text);

    const listContent = (): PropertyListContent =>
        new PropertyListContent({ list: [new PropertyListItem({ id: 'block-heading', label: 'Encabezado' })] });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyGroupComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyTreeDragService]
        }).compileComponents();

        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture = await renderComponent(PropertyGroupComponent, {
            tabId: 'properties',
            group: new PropertyGroup({
                id: 'content',
                label: 'Contenido',
                expanded: true,
                content: new PropertyFieldsContent({})
            })
        });
        component = fixture.componentInstance;
    });

    it('should reflect the expanded state through aria-expanded', () => {
        expect(header()?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should call PropertiesMenuService.toggleGroup when the header is clicked', () => {
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');
        header()?.click();

        expect(toggleSpy).toHaveBeenCalledWith('properties', 'content');
    });

    it('should not toggle a disabled group', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', label: 'Contenido', disabled: true })
        );
        fixture.detectChanges();

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');

        component.toggle();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('should not render the body when collapsed', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', label: 'Contenido', expanded: false, content: listContent() })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toContain('Encabezado');
    });

    it('should resolve the default label into a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content' }));
        fixture.detectChanges();

        expect(component.labelKey()).toBe('app.properties-menu.groups.content.label');
    });

    it('should keep an explicit label as-is', () => {
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content', label: 'Contenido' }));
        fixture.detectChanges();

        expect(component.labelKey()).toBe('Contenido');
    });

    it('should expose the full label as a tooltip, since a long one is truncated', () => {
        const name = 'unaVariableConUnNombreExageradamenteLargoQueNoCabe';
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'variable', label: name }));
        fixture.detectChanges();

        expect(header()?.querySelector(`[title="${name}"]`)?.textContent?.trim()).toBe(name);
    });

    it('should not render a header when showHeader is false', () => {
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content', showHeader: false }));
        fixture.detectChanges();

        expect(header()).toBeNull();
    });

    it('should stay expanded when showHeader is false', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', showHeader: false, content: listContent() })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Encabezado');
    });

    it('should render the list content and skip tree/fields rendering', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'add-block',
                expanded: true,
                content: new PropertyListContent({ list: [new PropertyListItem({ id: 'block-heading' })] })
            })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-property-list')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('bey-property-tree')).toBeNull();
    });

    it('should render the tree content and skip list/fields rendering', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({
                    tree: new PropertyTreeConfig({ nodes: [new PropertyTreeNode({ id: 'page-1' })] })
                })
            })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-property-tree')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('bey-property-list')).toBeNull();
    });

    it('should not render the empty-state add-block button when the tree has nodes', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({
                    tree: new PropertyTreeConfig({
                        nodes: [new PropertyTreeNode({ id: 'page-1' })],
                        addBlockLabel: 'add.label',
                        showEmptyStateAddBlock: true
                    })
                })
            })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="treeitem"]')).toBeTruthy();
        expect(buttons('add.label').length).toBe(1);
    });

    it('should not render the empty-state add-block button when showEmptyStateAddBlock is false', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ addBlockLabel: 'add.label' }) })
            })
        );
        fixture.detectChanges();

        expect(button('add.label')).toBeNull();
    });

    it('should render the empty-state add-block button when the tree is empty and opted in', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({
                    tree: new PropertyTreeConfig({ addBlockLabel: 'add.label', showEmptyStateAddBlock: true })
                })
            })
        );
        fixture.detectChanges();

        expect(button('add.label')).toBeTruthy();
    });

    it('should trigger the tree add-block event for the tab/group when the empty-state button is clicked', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({
                    tree: new PropertyTreeConfig({ addBlockLabel: 'add.label', showEmptyStateAddBlock: true })
                })
            })
        );
        const onTreeAddBlock = jest.fn();
        propertiesMenuService.setConfig(
            new PropertiesMenuConfig({ ...propertiesMenuService.config(), onTreeAddBlock })
        );
        fixture.detectChanges();

        button('add.label')?.click();

        expect(onTreeAddBlock).toHaveBeenCalledWith({ groupId: 'structure', tabId: 'properties' });
    });
});
