import { TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { TreeNode } from '../../../models/tree.model';
import { ModalTreeDialogComponent } from '../internal/modal-tree-dialog.component';
import { ModalTreeConfig, ModalTreeSize } from '../models/modal-tree.model';
import { ModalTreeService } from './modal-tree.service';

describe('ModalTreeService', () => {
    let service: ModalTreeService;

    const show = jest.fn();

    beforeEach(() => {
        show.mockReset();

        TestBed.configureTestingModule({
            providers: [ModalTreeService, { provide: BsModalService, useValue: { show } }]
        });

        service = TestBed.inject(ModalTreeService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should open the modal tree dialog with the provided config', () => {
        const modalReference = buildModalReference();
        show.mockReturnValue(modalReference);

        const config = buildConfig();
        const result = service.open(config);

        expect(result).toBe(modalReference);
        expect(show).toHaveBeenCalledWith(
            ModalTreeDialogComponent,
            expect.objectContaining({
                class: 'modal-dialog-centered',
                ignoreBackdropClick: true,
                initialState: { config },
                keyboard: false
            })
        );
    });

    it('should apply the configured size to the modal class', () => {
        show.mockReturnValue(buildModalReference());

        service.open(buildConfig(ModalTreeSize.Small));

        expect(show).toHaveBeenCalledWith(
            ModalTreeDialogComponent,
            expect.objectContaining({ class: 'modal-dialog-centered modal-sm' })
        );
    });
});

function buildConfig(size?: ModalTreeSize): ModalTreeConfig {
    return new ModalTreeConfig({
        nodes: [new TreeNode({ key: 'root' })],
        prefix: 'test.modal-tree',
        size
    });
}

function buildModalReference(): BsModalRef<ModalTreeDialogComponent> {
    return { hide: jest.fn() } as unknown as BsModalRef<ModalTreeDialogComponent>;
}
