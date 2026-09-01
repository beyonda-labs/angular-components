import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { TreeNode } from '../../../models/tree.model';
import { ModalTreeConfig } from '../models/modal-tree.model';
import { ModalTreeDialogComponent } from './modal-tree-dialog.component';

describe('ModalTreeDialogComponent', () => {
    let component: ModalTreeDialogComponent;
    let fixture: ComponentFixture<ModalTreeDialogComponent>;

    const hide = jest.fn();

    beforeEach(async () => {
        hide.mockReset();

        await TestBed.configureTestingModule({
            imports: [ModalTreeDialogComponent, TranslateModule.forRoot()],
            providers: [{ provide: BsModalRef, useValue: { hide } }]
        }).compileComponents();

        fixture = TestBed.createComponent(ModalTreeDialogComponent);
        component = fixture.componentInstance;
        component.config = buildConfig();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the tree inside the modal', () => {
        const tree = fixture.nativeElement.querySelector('bey-tree');

        expect(tree).toBeTruthy();
    });

    it('should expose the title key built from the prefix when no title is set', () => {
        expect(component.getTitle()).toBe('test.modal-tree.title');
    });

    it('should expose the configured title when set', () => {
        component.config = buildConfig({ title: 'custom.title' });

        expect(component.getTitle()).toBe('custom.title');
    });

    it('should hide the modal on dismiss', () => {
        component.dismiss();

        expect(hide).toHaveBeenCalled();
    });

    it('should hide the modal when the config close method is called', () => {
        component.config.close();

        expect(hide).toHaveBeenCalled();
    });

    it('should disable the confirm button while no node is selected', () => {
        expect(component.getConfirmButton().isDisabled).toBe(true);
    });

    it('should enable the confirm button once a node is selected', () => {
        component.config = buildConfig({ selectedKey: 'child' });

        expect(component.getConfirmButton().isDisabled).toBe(false);
    });

    it('should confirm with the selected node when the confirm button is clicked', () => {
        const onConfirm = jest.fn();
        component.config = buildConfig({ onConfirm, selectedKey: 'child' });

        component.getConfirmButton().action?.();

        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ key: 'child' }));
    });

    it('should dismiss when the cancel button is clicked', () => {
        component.getCancelButton().action?.();

        expect(hide).toHaveBeenCalled();
    });
});

function buildConfig(
    overrides?: Partial<{
        onConfirm: (node: TreeNode | undefined) => void;
        selectedKey: string;
        title: string;
    }>
): ModalTreeConfig {
    return new ModalTreeConfig({
        nodes: [new TreeNode({ key: 'root', children: [new TreeNode({ key: 'child' })] })],
        onConfirm: overrides?.onConfirm,
        prefix: 'test.modal-tree',
        selectedKey: overrides?.selectedKey,
        title: overrides?.title
    });
}
