import { inject, Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { ModalTreeDialogComponent } from '../internal/modal-tree-dialog.component';
import { ModalTreeConfig } from '../models/modal-tree.model';

@Injectable({
    providedIn: 'root'
})
export class ModalTreeService {
    private readonly bsModalService = inject(BsModalService);

    open<TData>(config: ModalTreeConfig<TData>): BsModalRef<ModalTreeDialogComponent> {
        const modalOptions: ModalOptions<ModalTreeDialogComponent> = {
            animated: true,
            class: `modal-dialog-centered ${config.size}`.trim(),
            ignoreBackdropClick: true,
            initialState: { config: config as ModalTreeConfig },
            keyboard: false
        };

        return this.bsModalService.show(ModalTreeDialogComponent, modalOptions);
    }
}
