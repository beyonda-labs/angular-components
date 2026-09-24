import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ButtonComponent } from '../../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../../internal/button/models/button-config.model';
import { TreeConfig } from '../../../models/tree.model';
import { TreeComponent } from '../../../tree.component';
import { ModalTreeConfig } from '../models/modal-tree.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule, TreeComponent],
    selector: 'bey-modal-tree-dialog',
    standalone: true,
    styleUrls: ['./modal-tree-dialog.component.css'],
    templateUrl: './modal-tree-dialog.component.html'
})
export class ModalTreeDialogComponent implements OnInit {
    config!: ModalTreeConfig;

    readonly titleIcon = faFolderTree;

    /* The dialog owns the selection so the tree repaints; the config keeps it for `confirm()`. */
    readonly selectedKey = signal<string>('');

    readonly treeConfig = computed<TreeConfig>(
        () =>
            new TreeConfig({
                expandedKeys: this.config.treeConfig.expandedKeys,
                nodes: this.config.treeConfig.nodes,
                onNodeSelect: node => this.select(node.key),
                prefix: this.config.treeConfig.prefix,
                selectedKey: this.selectedKey() || undefined
            })
    );

    readonly cancelButton = new ButtonConfig({
        action: () => this.dismiss(),
        label: 'angular-components.modal.actions.cancel',
        type: ButtonType.Secondary
    });

    readonly confirmButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.config.confirm(),
                isDisabled: !this.selectedKey(),
                label: 'angular-components.modal.actions.confirm',
                type: ButtonType.Primary
            })
    );

    private readonly bsModalReference: BsModalRef<ModalTreeDialogComponent> = inject(BsModalRef);

    ngOnInit(): void {
        this.config.closeHandler = () => this.bsModalReference.hide();
        this.selectedKey.set(this.config.treeConfig.selectedKey ?? '');
    }

    dismiss(): void {
        this.config.close();
    }

    getTitle(): string {
        return this.config.getTitle();
    }

    private select(key: string): void {
        this.selectedKey.set(key);
        this.config.treeConfig.selectedKey = key;
    }
}
