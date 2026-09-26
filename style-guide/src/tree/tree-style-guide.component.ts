import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeyTreeComponent, BeyTreeConfig, BeyTreeNode } from '@beyonda-labs/angular-components';
import { faFolder, faGear, faLaptopCode, faPalette, faServer } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyTreeComponent, TranslateModule],
    selector: 'bey-tree-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './tree-style-guide.component.html'
})
export class TreeStyleGuideComponent {
    readonly config: BeyTreeConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.config = new BeyTreeConfig({
            expandedKeys: ['engineering'],
            nodes: [
                new BeyTreeNode({
                    key: 'engineering',
                    icon: faFolder,
                    children: [
                        new BeyTreeNode({ key: 'frontend', icon: faPalette }),
                        new BeyTreeNode({ key: 'backend', icon: faServer }),
                        new BeyTreeNode({ key: 'platform', icon: faLaptopCode, isDisabled: true })
                    ]
                }),
                new BeyTreeNode({ key: 'operations', icon: faGear })
            ],
            onNodeSelect: node => this.onNodeSelect(node),
            prefix: 'angular-components-style-guide.tree',
            selectedKey: 'frontend'
        });
    }

    private onNodeSelect(node: BeyTreeNode): void {
        this.config.selectedKey = node.key;

        const message = this.translateService.instant('angular-components-style-guide.tree.selected');

        // eslint-disable-next-line no-console
        console.log(message, node.key);
    }
}
