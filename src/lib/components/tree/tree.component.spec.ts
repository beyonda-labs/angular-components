import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TreeConfig, TreeConfigParameters, TreeNode } from './models/tree.model';
import { TreeComponent } from './tree.component';

describe('TreeComponent', () => {
    let fixture: ComponentFixture<TreeComponent>;

    function buildNodes(): TreeNode[] {
        return [
            new TreeNode({
                key: 'root',
                label: 'Root',
                children: [new TreeNode({ key: 'child', label: 'Child' })]
            }),
            new TreeNode({ key: 'leaf', label: 'Leaf' })
        ];
    }

    function buildConfig(overrides: Partial<TreeConfigParameters> = {}): TreeConfig {
        return new TreeConfig({ prefix: 'demo', nodes: buildNodes(), ...overrides });
    }

    async function render(config: TreeConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(TreeComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function nodes(): HTMLElement[] {
        return [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="treeitem"]')];
    }

    function labels(): string[] {
        return nodes().map(node => node.textContent?.trim() ?? '');
    }

    function node(name: string): HTMLElement {
        const found = nodes().find(element => element.textContent?.trim().includes(name));

        if (!found) {
            throw new Error(`No node named ${name}`);
        }

        return found;
    }

    function toggleOf(name: string): HTMLButtonElement {
        return node(name).querySelector('button') as HTMLButtonElement;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TreeComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('renders the top level collapsed', async () => {
        await render();

        expect(labels()).toEqual(['Root', 'Leaf']);
    });

    it('renders the children of a node the config seeds as expanded', async () => {
        await render(buildConfig({ expandedKeys: ['root'] }));

        expect(labels()).toEqual(['Root', 'Child', 'Leaf']);
    });

    it('expands and collapses a node from its toggle, without selecting it', async () => {
        const onNodeSelect = jest.fn();
        await render(buildConfig({ onNodeSelect }));

        toggleOf('Root').click();
        fixture.detectChanges();
        expect(labels()).toContain('Child');

        toggleOf('Root').click();
        fixture.detectChanges();
        expect(labels()).not.toContain('Child');
        expect(onNodeSelect).not.toHaveBeenCalled();
    });

    it('reports every expand and collapse', async () => {
        const onNodeToggle = jest.fn();
        await render(buildConfig({ onNodeToggle }));

        toggleOf('Root').click();
        fixture.detectChanges();

        expect(onNodeToggle).toHaveBeenCalledWith(expect.objectContaining({ key: 'root' }), true);

        toggleOf('Root').click();
        fixture.detectChanges();

        expect(onNodeToggle).toHaveBeenCalledWith(expect.objectContaining({ key: 'root' }), false);
    });

    it('reports the node picked from its row', async () => {
        const onNodeSelect = jest.fn();
        await render(buildConfig({ onNodeSelect }));

        node('Leaf').click();

        expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 'leaf' }));
    });

    it('ignores a disabled node, from its row and from its toggle', async () => {
        const onNodeSelect = jest.fn();
        const onNodeToggle = jest.fn();
        await render(
            buildConfig({
                onNodeSelect,
                onNodeToggle,
                nodes: [
                    new TreeNode({
                        key: 'locked',
                        label: 'Locked',
                        isDisabled: true,
                        children: [new TreeNode({ key: 'inside', label: 'Inside' })]
                    })
                ]
            })
        );

        node('Locked').click();
        toggleOf('Locked').click();
        fixture.detectChanges();

        expect(onNodeSelect).not.toHaveBeenCalled();
        expect(onNodeToggle).not.toHaveBeenCalled();
        expect(labels()).not.toContain('Inside');
    });

    it('marks the node the config selects', async () => {
        await render(buildConfig({ selectedKey: 'leaf' }));

        expect(node('Leaf').getAttribute('aria-selected')).toBe('true');
        expect(node('Root').getAttribute('aria-selected')).toBe('false');
    });

    it('resolves a label the node does not carry from the config prefix', async () => {
        await render(buildConfig({ nodes: [new TreeNode({ key: 'root' })] }));

        expect(labels()).toEqual(['demo.nodes.root.label']);
    });

    it('takes a label the node does carry as it is', async () => {
        await render(buildConfig({ nodes: [new TreeNode({ key: 'root', label: 'shared.root' })] }));

        expect(labels()).toEqual(['shared.root']);
    });

    it('announces whether a node with children is open', async () => {
        await render();

        expect(node('Root').getAttribute('aria-expanded')).toBe('false');
        expect(node('Leaf').getAttribute('aria-expanded')).toBeNull();

        toggleOf('Root').click();
        fixture.detectChanges();

        expect(node('Root').getAttribute('aria-expanded')).toBe('true');
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ expandedKeys: ['root'] }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(labels()).toContain('Child');
    });
});
