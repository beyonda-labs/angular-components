import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TreeConfig, TreeNode } from './models/tree.model';
import { TreeComponent } from './tree.component';

describe('TreeComponent', () => {
    let component: TreeComponent;
    let fixture: ComponentFixture<TreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TreeComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TreeComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should render every top-level node', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        const nodes = fixture.nativeElement.querySelectorAll('.bey-tree-node');

        expect(nodes).toHaveLength(2);
    });

    it('should not render children by default (collapsed)', () => {
        component.config = buildConfig();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-tree-children')).toHaveLength(0);
    });

    it('should render children of nodes seeded as expanded', () => {
        component.config = buildConfig({ expandedKeys: ['fruits'] });
        fixture.detectChanges();

        const labels = [...fixture.nativeElement.querySelectorAll('.bey-tree-node-label')].map(element =>
            element.textContent.trim()
        );

        expect(labels).toEqual([
            'test.tree.nodes.fruits.label',
            'test.tree.nodes.apple.label',
            'test.tree.nodes.vegetables.label'
        ]);
    });

    it('should expand and collapse a node when its toggle is clicked, without selecting it', () => {
        const onNodeSelect = jest.fn();

        component.config = buildConfig({ onNodeSelect });
        fixture.detectChanges();

        const toggle = fixture.nativeElement.querySelector('.bey-tree-toggle') as HTMLButtonElement;

        toggle.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-tree-children')).toHaveLength(1);
        expect(onNodeSelect).not.toHaveBeenCalled();

        toggle.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.bey-tree-children')).toHaveLength(0);
    });

    it('should call onNodeToggle with the node and the new expanded state', () => {
        const onNodeToggle = jest.fn();

        component.config = buildConfig({ onNodeToggle });
        fixture.detectChanges();

        const toggle = fixture.nativeElement.querySelector('.bey-tree-toggle') as HTMLButtonElement;

        toggle.click();

        expect(onNodeToggle).toHaveBeenCalledWith(expect.objectContaining({ key: 'fruits' }), true);
    });

    it('should call onNodeSelect when a node row is clicked', () => {
        const onNodeSelect = jest.fn();

        component.config = buildConfig({ onNodeSelect });
        fixture.detectChanges();

        const nodes = fixture.nativeElement.querySelectorAll('.bey-tree-node');

        (nodes[1] as HTMLElement).click();

        expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 'vegetables' }));
    });

    it('should not select a disabled node', () => {
        const onNodeSelect = jest.fn();

        component.config = buildConfig({ disableVegetables: true, onNodeSelect });
        fixture.detectChanges();

        const nodes = fixture.nativeElement.querySelectorAll('.bey-tree-node');

        (nodes[1] as HTMLElement).click();

        expect(onNodeSelect).not.toHaveBeenCalled();
    });

    it('should reflect the selected node from config.selectedKey', () => {
        component.config = buildConfig({ selectedKey: 'vegetables' });
        fixture.detectChanges();

        const nodes = fixture.nativeElement.querySelectorAll('.bey-tree-node');

        expect(nodes[0].classList.contains('bey-tree-node-selected')).toBe(false);
        expect(nodes[1].classList.contains('bey-tree-node-selected')).toBe(true);
    });

    it('should resolve the default label key from the prefix', () => {
        component.config = buildConfig();

        expect(component.getLabel(new TreeNode({ key: 'fruits' }))).toBe('test.tree.nodes.fruits.label');
    });

    it('should keep a custom label key as-is', () => {
        component.config = buildConfig();

        expect(component.getLabel(new TreeNode({ key: 'fruits', label: 'custom.label.key' }))).toBe(
            'custom.label.key'
        );
    });

    it('should not toggle or select a disabled node from the toggle button', () => {
        const onNodeToggle = jest.fn();

        component.config = buildConfig({ disableFruits: true, onNodeToggle });
        fixture.detectChanges();

        const toggle = fixture.nativeElement.querySelector('.bey-tree-toggle') as HTMLButtonElement;

        toggle.click();

        expect(onNodeToggle).not.toHaveBeenCalled();
    });
});

function buildConfig(overrides?: {
    disableFruits?: boolean;
    disableVegetables?: boolean;
    expandedKeys?: string[];
    onNodeSelect?: (node: TreeNode) => void;
    onNodeToggle?: (node: TreeNode, expanded: boolean) => void;
    selectedKey?: string;
}): TreeConfig {
    return new TreeConfig({
        expandedKeys: overrides?.expandedKeys,
        nodes: [
            new TreeNode({
                key: 'fruits',
                children: [new TreeNode({ key: 'apple' })],
                isDisabled: overrides?.disableFruits ?? false
            }),
            new TreeNode({
                key: 'vegetables',
                isDisabled: overrides?.disableVegetables ?? false
            })
        ],
        onNodeSelect: overrides?.onNodeSelect,
        onNodeToggle: overrides?.onNodeToggle,
        prefix: 'test.tree',
        selectedKey: overrides?.selectedKey
    });
}
