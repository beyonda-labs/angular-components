import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { PropertyTreeComponent } from './property-tree.component';

describe('PropertyTreeComponent', () => {
    let fixture: ComponentFixture<PropertyTreeComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const treeItems = (): HTMLElement[] => queryAll<HTMLElement>(fixture, '[role="treeitem"]');

    const toggle = (index: number): HTMLButtonElement | null =>
        treeItems()[index].querySelector<HTMLButtonElement>(':scope > button');

    const button = (text: string): HTMLButtonElement | null => queryButton(fixture, text);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTreeComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyTreeDragService]
        }).compileComponents();

        propertiesMenuService = TestBed.inject(PropertiesMenuService);

        fixture = await renderComponent(PropertyTreeComponent, {
            tabId: 'structure',
            groupId: 'structure-tree',
            nodes: [
                new PropertyTreeNode({
                    id: 'page-1',
                    label: 'Page 1',
                    children: [new PropertyTreeNode({ id: 'header', label: 'Header' })]
                })
            ]
        });
    });

    it('renders root and nested node labels', () => {
        expect(textsOf(treeItems())).toEqual(['Page 1', 'Header']);
    });

    it('selects the node through the menu service when its row is clicked', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectTreeNode');
        treeItems()[0].click();

        expect(selectSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
    });

    it('toggles the node through the menu service when its chevron is clicked, without selecting it', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectTreeNode');
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleTreeNode');

        button('angular-components.properties-menu.tree.collapse')?.click();

        expect(toggleSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
        expect(selectSpy).not.toHaveBeenCalled();
    });

    it('names the chevron after what it does and gives none to a node without children', () => {
        fixture.componentRef.setInput('nodes', [
            new PropertyTreeNode({
                id: 'page-1',
                label: 'Page 1',
                expanded: false,
                children: [new PropertyTreeNode({ id: 'header', label: 'Header' })]
            }),
            new PropertyTreeNode({ id: 'footer', label: 'Footer' })
        ]);
        fixture.detectChanges();

        expect(toggle(0)?.getAttribute('aria-label')).toBe('angular-components.properties-menu.tree.expand');
        expect(toggle(1)).toBeNull();
    });

    it('selects the focused row with Enter or Space', () => {
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectTreeNode');

        treeItems()[1].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
        treeItems()[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));

        expect(selectSpy.mock.calls).toEqual([
            ['structure', 'structure-tree', 'header'],
            ['structure', 'structure-tree', 'page-1']
        ]);
    });

    it('neither selects nor toggles a disabled row, which leaves the tab order', () => {
        fixture.componentRef.setInput('nodes', [
            new PropertyTreeNode({
                id: 'page-1',
                label: 'Page 1',
                disabled: true,
                children: [new PropertyTreeNode({ id: 'header', label: 'Header' })]
            })
        ]);
        fixture.detectChanges();
        const selectSpy = jest.spyOn(propertiesMenuService, 'selectTreeNode');

        treeItems()[0].click();

        expect(selectSpy).not.toHaveBeenCalled();
        expect(toggle(0)?.disabled).toBe(true);
        expect(treeItems()[0].getAttribute('aria-disabled')).toBe('true');
        expect(treeItems()[0].tabIndex).toBe(-1);
    });

    it('collapses an expanded row with ArrowLeft and ignores ArrowRight on it', () => {
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleTreeNode');

        treeItems()[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
        expect(toggleSpy).not.toHaveBeenCalled();

        treeItems()[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
        expect(toggleSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
    });

    it('expands a collapsed row with ArrowRight', () => {
        fixture.componentRef.setInput('nodes', [
            new PropertyTreeNode({
                id: 'page-1',
                label: 'Page 1',
                expanded: false,
                children: [new PropertyTreeNode({ id: 'header', label: 'Header' })]
            })
        ]);
        fixture.detectChanges();
        const toggleSpy = jest.spyOn(propertiesMenuService, 'toggleTreeNode');

        treeItems()[0].dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));

        expect(toggleSpy).toHaveBeenCalledWith('structure', 'structure-tree', 'page-1');
    });

    it('renders no add-block button without a label', () => {
        expect(fixture.nativeElement.textContent).not.toContain('Add block');
    });

    it('asks the menu service for a new block when the add-block button is clicked', () => {
        fixture.componentRef.setInput('addBlockLabel', 'Add block');
        fixture.detectChanges();

        const addBlockSpy = jest.spyOn(propertiesMenuService, 'triggerTreeAddBlock');
        button('Add block')?.click();

        expect(addBlockSpy).toHaveBeenCalledWith('structure', 'structure-tree');
    });

    it('shows the default label of a node as a prefixed translation key', () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        fixture.componentRef.setInput('nodes', [new PropertyTreeNode({ id: 'page-1' })]);
        fixture.detectChanges();

        expect(textsOf(treeItems())).toEqual(['app.properties-menu.tree.page-1.label']);
    });
});

describe('PropertyTreeComponent · label parameters', () => {
    let translate: TranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTreeComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyTreeDragService]
        }).compileComponents();

        translate = TestBed.inject(TranslateService);
        translate.setTranslation('en', { structure: { page: 'Page {{number}}' } });
        translate.setTranslation('es', { structure: { page: 'Página {{number}}' } });
        translate.use('en');
    });

    it('interpolates the label parameters of a node and follows a language change', async () => {
        const fixture = await renderComponent(PropertyTreeComponent, {
            groupId: 'structure-tree',
            nodes: [new PropertyTreeNode({ id: 'page-1', label: 'structure.page', labelParameters: { number: 1 } })],
            tabId: 'structure'
        });

        expect(textsOf(queryAll(fixture, '[role="treeitem"]'))).toEqual(['Page 1']);

        translate.use('es');
        await settle(fixture);

        expect(textsOf(queryAll(fixture, '[role="treeitem"]'))).toEqual(['Página 1']);
    });
});
