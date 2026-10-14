import { TestBed } from '@angular/core/testing';
import { BeyModalTreeConfig, BeyModalTreeService, BeyTreeNode } from '@beyonda-labs/angular-components';
import { BsModalService } from 'ngx-bootstrap/modal';

import { provideBeyTesting } from './providers/testing.providers';
import { pickInTreeDialog, treeDialogItems } from './tree-dialog';

describe('testing/tree-dialog', () => {
    const onConfirm = jest.fn();

    beforeEach(() => {
        onConfirm.mockReset();
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
        TestBed.inject(BeyModalTreeService).open(
            new BeyModalTreeConfig({
                nodes: [
                    new BeyTreeNode({
                        children: [new BeyTreeNode({ key: 'reports', label: 'Reports' })],
                        key: 'root',
                        label: 'Root'
                    })
                ],
                onConfirm,
                prefix: 'demo.move'
            })
        );
    });

    afterEach(() => {
        TestBed.inject(BsModalService).hide();
    });

    it('lists the items of the open tree dialog', () => {
        expect(treeDialogItems().map(item => item.textContent?.trim())).toEqual(['Root', 'Reports']);
    });

    it('picks an item and confirms the dialog', () => {
        pickInTreeDialog('Reports');

        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ key: 'reports' }));
    });

    it('throws when no item has the label', () => {
        expect(() => pickInTreeDialog('Archive')).toThrow('No tree item named Archive');
    });
});
