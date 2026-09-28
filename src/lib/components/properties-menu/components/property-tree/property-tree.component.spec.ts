import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTreeDragService } from '../../services/property-tree-drag.service';
import { PropertyTreeComponent } from './property-tree.component';

describe('PropertyTreeComponent', () => {
    let component: PropertyTreeComponent;
    let fixture: ComponentFixture<PropertyTreeComponent>;
    let propertiesMenuService: PropertiesMenuService;

    const treeItems = (): HTMLButtonElement[] => queryAll<HTMLButtonElement>(fixture, '[role="treeitem"]');

    const toggle = (index: number): HTMLElement | null =>
        treeItems()[index].querySelector(':scope > span[aria-hidden="true"]');

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
        component = fixture.componentInstance;
    });

    it('should render root and nested node labels', () => {
        expect(textsOf(treeItems())).toEqual(['Page 1', 'Header']);
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
