import { Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFolderTree, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ButtonComponent } from '../../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../../internal/button/models/button-config.model';
import { TreeComponent } from '../../../tree.component';
import { ModalTreeConfig } from '../models/modal-tree.model';

@Component({
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule, TreeComponent],
    selector: 'bey-modal-tree-dialog',
    standalone: true,
    styleUrls: ['./modal-tree-dialog.component.css'],
    templateUrl: './modal-tree-dialog.component.html'
})
export class ModalTreeDialogComponent implements OnInit {
    config!: ModalTreeConfig;

    private readonly bsModalReference: BsModalRef<ModalTreeDialogComponent> = inject(BsModalRef);

    ngOnInit(): void {
        this.config.closeHandler = () => this.bsModalReference.hide();
    }

    dismiss(): void {
        this.config.close();
    }

    getCancelButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.dismiss(),
            label: 'angular-components.modal.actions.cancel',
            type: ButtonType.Secondary
        });
    }

    getConfirmButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.config.confirm(),
            isDisabled: !this.config.hasSelection(),
            label: 'angular-components.modal.actions.confirm',
            type: ButtonType.Primary
        });
    }

    getIcon(): IconDefinition {
        return faFolderTree;
    }

    getTitle(): string {
        return this.config.getTitle();
    }
}
