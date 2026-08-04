import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyGroup } from '../../models/property-group.model';
import { PropertyFieldsContent, PropertyListContent, PropertyTreeContent } from '../../models/property-group-content.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertyTreeConfig } from '../../models/property-tree-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyGroupComponent } from './property-group.component';

describe('PropertyGroupComponent', () => {
    let component: PropertyGroupComponent;
    let fixture: ComponentFixture<PropertyGroupComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyGroupComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyGroupComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        component.tabId = 'properties';
        component.group = new PropertyGroup({ id: 'content', label: 'Contenido', expanded: true, content: new PropertyFieldsContent({}) });
        fixture.detectChanges();
    });

    it('should reflect the expanded state through aria-expanded', () => {
        const header: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-group-header');

        expect(header.getAttribute('aria-expanded')).toBe('true');
    });

    it('should call PropertiesMenuService.toggleGroup when the header is clicked', () => {
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');
        const header: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-group-header');

        header.click();

        expect(toggleSpy).toHaveBeenCalledWith('properties', 'content');
    });

    it('should not toggle a disabled group', () => {
        component.group = new PropertyGroup({ id: 'content', label: 'Contenido', disabled: true });
        fixture.detectChanges();

        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleGroup');

        component.toggle();

        expect(toggleSpy).not.toHaveBeenCalled();
    });

    it('should not render the body when collapsed', () => {
        component.group = new PropertyGroup({ id: 'content', label: 'Contenido', expanded: false });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-group-body')).toBeFalsy();
    });

    it('should resolve the default label into a prefixed translation key', () => {
        propertiesMenuService.setConfig({ prefix: 'app.properties-menu' });
        component.group = new PropertyGroup({ id: 'content' });
        fixture.detectChanges();

        expect(component.labelKey).toBe('app.properties-menu.groups.content.label');
    });

    it('should keep an explicit label as-is', () => {
        component.group = new PropertyGroup({ id: 'content', label: 'Contenido' });
        fixture.detectChanges();

        expect(component.labelKey).toBe('Contenido');
    });

    it('should not render a header when showHeader is false', () => {
        component.group = new PropertyGroup({ id: 'content', showHeader: false });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-group-header')).toBeNull();
    });

    it('should stay expanded when showHeader is false', () => {
        component.group = new PropertyGroup({ id: 'content', showHeader: false });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-group-body')).toBeTruthy();
    });

    it('should render the list content and skip tree/fields rendering', () => {
        component.group = new PropertyGroup({
            id: 'add-block',
            expanded: true,
            content: new PropertyListContent({ list: [new PropertyListItem({ id: 'block-heading' })] })
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-property-list')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('bey-property-tree')).toBeNull();
    });

    it('should render the tree content and skip list/fields rendering', () => {
        component.group = new PropertyGroup({
            id: 'structure',
            expanded: true,
            content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ nodes: [new PropertyTreeNode({ id: 'page-1' })] }) })
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('bey-property-tree')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('bey-property-list')).toBeNull();
    });

    it('should not render the empty-state add-block button when the tree has nodes', () => {
        component.group = new PropertyGroup({
            id: 'structure',
            expanded: true,
            content: new PropertyTreeContent({
                tree: new PropertyTreeConfig({
                    nodes: [new PropertyTreeNode({ id: 'page-1' })],
                    addBlockLabel: 'add.label',
                    showEmptyStateAddBlock: true
                })
            })
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-tab-empty-add-block')).toBeNull();
    });

    it('should not render the empty-state add-block button when showEmptyStateAddBlock is false', () => {
        component.group = new PropertyGroup({
            id: 'structure',
            expanded: true,
            content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ addBlockLabel: 'add.label' }) })
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-tab-empty-add-block')).toBeNull();
    });

    it('should render the empty-state add-block button when the tree is empty and opted in', () => {
        component.group = new PropertyGroup({
            id: 'structure',
            expanded: true,
            content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ addBlockLabel: 'add.label', showEmptyStateAddBlock: true }) })
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-tab-empty-add-block')).toBeTruthy();
    });

    it('should trigger the tree add-block event for the tab/group when the empty-state button is clicked', () => {
        component.group = new PropertyGroup({
            id: 'structure',
            expanded: true,
            content: new PropertyTreeContent({ tree: new PropertyTreeConfig({ addBlockLabel: 'add.label', showEmptyStateAddBlock: true }) })
        });
        const onTreeAddBlock = jest.fn();
        propertiesMenuService.onTreeAddBlock = onTreeAddBlock;
        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-tab-empty-add-block');
        button.click();

        expect(onTreeAddBlock).toHaveBeenCalledWith({ groupId: 'structure', tabId: 'properties' });
    });
});
