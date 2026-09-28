import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ButtonComponent } from '../../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../../internal/button/models/button-config.model';
import { TreeConfig } from '../../../models/tree.model';
import { findNodeByKey } from '../../../models/tree-node-search';
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
    readonly cancelButton = new ButtonConfig({
        action: () => this.dismiss(),
        label: 'angular-components.modal.actions.cancel',
        type: ButtonType.Secondary
    });
    config!: ModalTreeConfig;
    readonly confirmButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.confirm(),
                isDisabled: !this.selectedKey(),
                label: 'angular-components.modal.actions.confirm',
                type: ButtonType.Primary
            })
    );
    readonly expandedKeys = signal<string[]>([]);
    readonly selectedKey = signal<string>('');
    readonly titleIcon = faFolderTree;
    readonly treeConfig = computed<TreeConfig>(
        () =>
            new TreeConfig({
                expandedKeys: this.expandedKeys(),
                nodes: this.config.treeConfig.nodes,
                onNodeSelect: node => this.selectedKey.set(node.key),
                onNodeToggle: (node, expanded) => this.toggle(node.key, expanded),
                prefix: this.config.treeConfig.prefix,
                selectedKey: this.selectedKey() || undefined
            })
    );

    private readonly bsModalReference: BsModalRef<ModalTreeDialogComponent> = inject(BsModalRef);

    ngOnInit(): void {
        this.expandedKeys.set(this.config.treeConfig.expandedKeys ?? []);
        this.selectedKey.set(this.config.treeConfig.selectedKey ?? '');
    }

    dismiss(): void {
        this.bsModalReference.hide();
    }

    private confirm(): void {
        this.config.onConfirm?.(findNodeByKey(this.config.treeConfig.nodes, this.selectedKey()));
    }

    private toggle(key: string, expanded: boolean): void {
        this.expandedKeys.update(keys => (expanded ? [...keys, key] : keys.filter(current => current !== key)));
    }
}
