import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BeyTreeComponent, BeyTreeConfig, BeyTreeNode } from '@beyonda-labs/angular-components';
import { faFolder, faGear, faLaptopCode, faPalette, faServer } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const NODES = [
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
];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyTreeComponent, TranslateModule],
    selector: 'bey-tree-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './tree-style-guide.component.html'
})
export class TreeStyleGuideComponent {
    readonly config = computed(
        () =>
            new BeyTreeConfig({
                expandedKeys: ['engineering'],
                nodes: NODES,
                onNodeSelect: node => this.selectedKey.set(node.key),
                prefix: 'angular-components-style-guide.tree',
                selectedKey: this.selectedKey()
            })
    );
    readonly selectedKey = signal('frontend');
}
