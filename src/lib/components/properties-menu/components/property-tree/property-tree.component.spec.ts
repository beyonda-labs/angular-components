import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { PropertyTreeComponent } from './property-tree.component';

describe('PropertyTreeComponent', () => {
    let component: PropertyTreeComponent;
    let fixture: ComponentFixture<PropertyTreeComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const treeItems = (): HTMLButtonElement[] => [...fixture.nativeElement.querySelectorAll('[role="treeitem"]')];

    const toggle = (index: number): HTMLElement | null =>
        treeItems()[index].querySelector(':scope > span[aria-hidden="true"]');

    const button = (text: string): HTMLButtonElement | undefined =>
        [...fixture.nativeElement.querySelectorAll('button')].find(element => element.textContent?.trim() === text);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTreeComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyTreeDragService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTreeComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture.componentRef.setInput('tabId', 'structure');
        fixture.componentRef.setInput('groupId', 'structure-tree');
        fixture.componentRef.setInput('nodes', [
            new PropertyTreeNode({
                id: 'page-1',
                label: 'Page 1',
                children: [new PropertyTreeNode({ id: 'header', label: 'Header' })]
            })
        ]);
        fixture.detectChanges();
    });

    it('should render root and nested node labels', () => {
        expect(treeItems().map(element => element.textContent?.trim())).toEqual(['Page 1', 'Header']);
    });

    it('should call PropertiesMenuService.selectTreeNode when a row is clicked', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectTreeNode');
        treeItems()[0].click();

        expect(selectSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
    });

    it('should call PropertiesMenuService.toggleTreeNode when the chevron is clicked', () => {
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleTreeNode');
        toggle(0)?.click();

        expect(toggleSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
    });

    it('should not render the add-block button without a label', () => {
        expect(fixture.nativeElement.textContent).not.toContain('Add block');
    });

    it('should call PropertiesMenuService.triggerTreeAddBlock when the add-block button is clicked', () => {
        fixture.componentRef.setInput('addBlockLabel', 'Add block');
        fixture.detectChanges();

        const addBlockSpy = jest.spyOn(propertiesMenuService, 'triggerTreeAddBlock');
        button('Add block')?.click();

        expect(addBlockSpy).toHaveBeenCalledWith('structure', 'structure-tree');
    });

    it('should resolve a default node label into a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));

        expect(component.labelKey(new PropertyTreeNode({ id: 'page-1' }))).toBe(
            'app.properties-menu.tree.page-1.label'
        );
    });
});
