import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton } from '@testing/dom';

import { PropertyTextField } from './models/fields/property-text-field.model';
import { PropertiesMenuConfig, PropertiesMenuConfigParameters } from './models/properties-menu-config.model';
import { PropertyGroup } from './models/property-group.model';
import { PropertyFieldsContent, PropertyListContent, PropertyTreeContent } from './models/property-group-content.model';
import { PropertyListItem } from './models/property-list-item.model';
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
