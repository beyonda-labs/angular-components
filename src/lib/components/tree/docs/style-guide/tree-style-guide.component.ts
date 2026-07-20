import { Component, inject } from '@angular/core';
import { faFolder, faGear, faLaptopCode, faPalette, faServer } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TreeConfig, TreeNode } from '../../models/tree.model';
import { TreeComponent } from '../../tree.component';

@Component({
    imports: [TreeComponent, TranslateModule],
    selector: 'bey-tree-style-guide',
    standalone: true,
    templateUrl: './tree-style-guide.component.html'
})
export class TreeStyleGuideComponent {
    readonly config: TreeConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.config = new TreeConfig({
            expandedKeys: ['engineering'],
            nodes: [
                new TreeNode({
                    key: 'engineering',
                    icon: faFolder,
                    children: [
                        new TreeNode({ key: 'frontend', icon: faPalette }),
                        new TreeNode({ key: 'backend', icon: faServer }),
                        new TreeNode({ key: 'platform', icon: faLaptopCode, isDisabled: true })
                    ]
                }),
                new TreeNode({ key: 'operations', icon: faGear })
            ],
            onNodeSelect: node => this.onNodeSelect(node),
            prefix: 'angular-components-style-guide.tree',
            selectedKey: 'frontend'
        });
    }

    private onNodeSelect(node: TreeNode): void {
        this.config.selectedKey = node.key;

        const message = this.translateService.instant('angular-components-style-guide.tree.selected');

        // eslint-disable-next-line no-console
        console.log(message, node.key);
    }
}
