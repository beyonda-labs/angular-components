import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeySearchComponent,
    BeySearchConfig,
    BeySearchField,
    BeySearchFieldType,
    BeySearchFilter
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.search';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeySearchComponent, TranslateModule],
    selector: 'bey-search-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './search-style-guide.component.html'
})
export class SearchStyleGuideComponent {
    readonly appliedFilters = signal<BeySearchFilter[]>([]);
    readonly config = new BeySearchConfig({
        mainField: 'name',
        onFiltersChange: filters => this.appliedFilters.set(filters),
        prefix: PREFIX,
        fields: [
            new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
            new BeySearchField({ key: 'age', type: BeySearchFieldType.Number }),
            new BeySearchField({ key: 'active', type: BeySearchFieldType.Boolean }),
            new BeySearchField({
                key: 'role',
                type: BeySearchFieldType.Select,
                options: [
                    { label: `${PREFIX}.roles.admin`, value: 'admin' },
                    { label: `${PREFIX}.roles.editor`, value: 'editor' }
                ]
            })
        ]
    });
    readonly summary = () =>
        this.appliedFilters()
            .map(filter => `${filter.field} ${filter.operator} ${String(filter.value)}`)
            .join(', ');
}
