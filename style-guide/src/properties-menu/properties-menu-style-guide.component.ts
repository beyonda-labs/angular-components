import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeyPropertiesMenuComponent,
    BeyPropertyFieldValueChange,
    BeyPropertyListItemSelect,
    BeyPropertyTreeAddBlock,
    BeyPropertyTreeNodeSelect,
    BeyPropertyVariable,
    BeyPropertyVariableSelection
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { buildPropertiesMenuConfig, EXAMPLE_VARIABLES } from './properties-menu-style-guide.config';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyPropertiesMenuComponent, TranslateModule],
    selector: 'bey-properties-menu-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './properties-menu-style-guide.component.css'],
    templateUrl: './properties-menu-style-guide.component.html'
})
export class PropertiesMenuStyleGuideComponent {
    readonly lastFieldChange = signal<BeyPropertyFieldValueChange | null>(null);
    readonly lastListItemSelect = signal<BeyPropertyListItemSelect | null>(null);
    readonly lastTreeAddBlock = signal<BeyPropertyTreeAddBlock | null>(null);
    readonly lastTreeNodeSelect = signal<BeyPropertyTreeNodeSelect | null>(null);
    readonly lastVariableSelection = signal<BeyPropertyVariableSelection | null>(null);
    readonly variables = signal<BeyPropertyVariable[]>([]);

    readonly config = buildPropertiesMenuConfig({
        onFieldValueChange: change => this.lastFieldChange.set(change),
        onListItemSelect: event => this.lastListItemSelect.set(event),
        onTreeAddBlock: event => this.lastTreeAddBlock.set(event),
        onTreeNodeSelect: event => this.lastTreeNodeSelect.set(event),
        onVariableSelect: selection => this.lastVariableSelection.set(selection)
    });

    provideVariables(): void {
        this.variables.set(EXAMPLE_VARIABLES);
    }
}
