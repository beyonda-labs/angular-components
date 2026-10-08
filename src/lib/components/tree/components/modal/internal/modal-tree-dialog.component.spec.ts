import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, settle } from '@testing/dom';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { TreeNode } from '../../../models/tree.model';
import { ModalTreeConfig } from '../models/modal-tree.model';
import { ModalTreeDialogComponent } from './modal-tree-dialog.component';

describe('ModalTreeDialogComponent', () => {
    let fixture: ComponentFixture<ModalTreeDialogComponent>;
    const hide = jest.fn();

    function buildConfig(
        overrides: Partial<{
            onConfirm: (node: TreeNode | undefined) => void;
            selectedKey: string;
            title: string;
        }> = {}
    ): ModalTreeConfig {
        return new ModalTreeConfig({
            nodes: [
                new TreeNode({ key: 'root', label: 'Root', children: [new TreeNode({ key: 'child', label: 'Child' })] })
            ],
            prefix: 'test.modal-tree',
            ...overrides
        });
    }

    async function render(config: ModalTreeConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(ModalTreeDialogComponent);
        fixture.componentInstance.config = config;
        await settle(fixture);
    }

    function buttonLabelled(label: string): HTMLButtonElement {
        const found = queryAll<HTMLButtonElement>(fixture, 'button').find(button =>
            button.textContent?.includes(label)
        );

        if (!found) {
            throw new Error(`No button labelled ${label}`);
        }

        return found;
    }

    function treeNode(name: string): HTMLElement {
        const found = queryAll(fixture, '[role="treeitem"]').find(node => node.textContent?.trim().includes(name));

        if (!found) {
            throw new Error(`No node named ${name}`);
        }

        return found;
    }

    beforeEach(async () => {
        hide.mockReset();

        await TestBed.configureTestingModule({
            imports: [ModalTreeDialogComponent, TranslateModule.forRoot()],
            providers: [{ provide: BsModalRef, useValue: { hide } }]
        }).compileComponents();
    });

    it('shows the tree inside the dialog', async () => {
        await render();

        expect(fixture.nativeElement.querySelector('bey-tree')).toBeTruthy();
        expect(treeNode('Root')).toBeTruthy();
    });

    it('builds the title from the prefix unless one is given', async () => {
        await render();
        expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('test.modal-tree.title');

        await render(buildConfig({ title: 'custom.title' }));
        expect(fixture.nativeElement.querySelector('h2').textContent.trim()).toBe('custom.title');
    });

    it('cannot be confirmed until a node is picked', async () => {
        await render();

        expect(buttonLabelled('confirm').disabled).toBe(true);

        treeNode('Root').click();
        fixture.detectChanges();

        expect(buttonLabelled('confirm').disabled).toBe(false);
    });

    it('starts ready to confirm when the config already names a selection', async () => {
        await render(buildConfig({ selectedKey: 'child' }));

        expect(buttonLabelled('confirm').disabled).toBe(false);
    });

    it('reports the node picked in the tree', async () => {
        const onConfirm = jest.fn();
        await render(buildConfig({ onConfirm }));

        treeNode('Root').click();
        fixture.detectChanges();
        buttonLabelled('confirm').click();

        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ key: 'root' }));
    });

    it('closes from the cancel button', async () => {
        await render();

        buttonLabelled('cancel').click();

        expect(hide).toHaveBeenCalled();
    });

    it('keeps a branch the user collapsed when a node is picked afterwards', async () => {
        await render();

        treeNode('Root').querySelector('button')?.click();
        fixture.detectChanges();
        treeNode('Root').click();
        fixture.detectChanges();

        expect(treeNode('Root').getAttribute('aria-expanded')).toBe('false');
        expect(queryAll(fixture, '[role="treeitem"]').some(node => node.textContent?.includes('Child'))).toBe(false);
    });
});
