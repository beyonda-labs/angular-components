import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, textsOf } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyGroup } from '../../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyGroupTab,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from '../../models/property-group-content.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertyTreeConfig } from '../../models/property-tree-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { PropertyGroupComponent } from './property-group.component';

describe('PropertyGroupComponent', () => {
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
    });

    it('reflects the expanded state through aria-expanded', () => {
        expect(header()?.getAttribute('aria-expanded')).toBe('true');
    });

    it('toggles the group through the menu service when the header is clicked', () => {
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');
        header()?.click();

        expect(toggleSpy).toHaveBeenCalledWith('properties', 'content');
    });

    it('does not toggle a disabled group', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', label: 'Contenido', disabled: true })
        );
        fixture.detectChanges();

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');

        header()?.click();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('does not render the body while collapsed', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', label: 'Contenido', expanded: false, content: listContent() })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toContain('Encabezado');
    });

    it('shows the default label as a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content' }));
        fixture.detectChanges();

        expect(header()?.textContent?.trim()).toBe('app.properties-menu.groups.content.label');
    });

    it('shows an explicit label as it is', () => {
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content', label: 'Contenido' }));
        fixture.detectChanges();

        expect(header()?.textContent?.trim()).toBe('Contenido');
    });

    it('exposes the full label as a tooltip, since a long one is truncated', () => {
        const name = 'unaVariableConUnNombreExageradamenteLargoQueNoCabe';
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'variable', label: name }));
        fixture.detectChanges();

        expect(header()?.querySelector(`[title="${name}"]`)?.textContent?.trim()).toBe(name);
    });

    it('renders no header when showHeader is false', () => {
        fixture.componentRef.setInput('group', new PropertyGroup({ id: 'content', showHeader: false }));
        fixture.detectChanges();

        expect(header()).toBeNull();
    });

    it('stays expanded when showHeader is false', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'content', showHeader: false, content: listContent() })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Encabezado');
    });

    it('renders the list content alone', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({ id: 'add-block', expanded: true, content: listContent() })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Encabezado');
        expect(queryAll(fixture, '[role="tree"], [role="treeitem"]')).toEqual([]);
    });

    it('renders the tree content alone', () => {
        fixture.componentRef.setInput(
            'group',
            new PropertyGroup({
                id: 'structure',
                expanded: true,
                content: new PropertyTreeContent({
                    tree: new PropertyTreeConfig({ nodes: [new PropertyTreeNode({ id: 'page-1', label: 'Página 1' })] })
                })
            })
        );
        fixture.detectChanges();

        expect(textsOf(queryAll(fixture, '[role="treeitem"]'))).toEqual(['Página 1']);
        expect(fixture.nativeElement.textContent).not.toContain('Encabezado');
    });

    it('leaves the add-block button to the tree when it has nodes', () => {
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

    it('renders no empty-state add-block button when showEmptyStateAddBlock is false', () => {
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

    it('renders the empty-state add-block button for an empty tree that opts in', () => {
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

    it('calls onTreeAddBlock with the tab and group when the empty-state button is clicked', () => {
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

describe('PropertyGroupComponent · label parameters', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyGroupComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyTreeDragService]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', { borders: { side: '{{side}} side', title: 'Borders of {{name}}' } });
        translate.use('en');
    });

    it('interpolates the label parameters of the group and of its tabs', async () => {
        const fixture = await renderComponent(PropertyGroupComponent, {
            group: new PropertyGroup({
                content: new PropertyTabsContent({
                    tabs: [
                        new PropertyGroupTab({ id: 'top', label: 'borders.side', labelParameters: { side: 'Top' } }),
                        new PropertyGroupTab({ id: 'left', label: 'borders.side', labelParameters: { side: 'Left' } })
                    ]
                }),
                expanded: true,
                id: 'borders',
                label: 'borders.title',
                labelParameters: { name: 'Heading' }
            }),
            tabId: 'properties'
        });

        expect(queryButton(fixture, 'Borders of Heading')).not.toBeNull();
        expect(textsOf(queryAll(fixture, '[role="tab"]'))).toEqual(['Top side', 'Left side']);
    });
});
