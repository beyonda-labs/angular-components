import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SearchConfig, SearchField, SearchFieldType } from '../../models/search.model';
import { SearchFilter } from '../../models/search-filter.model';
import { SearchComponent } from '../../search.component';

const PREFIX = 'angular-components-style-guide.search';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SearchComponent, TranslateModule],
    selector: 'bey-search-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './search-style-guide.component.html'
})
export class SearchStyleGuideComponent {
    readonly appliedFilters = signal<SearchFilter[]>([]);

    readonly config = new SearchConfig({
        mainField: 'name',
        onFiltersChange: filters => this.appliedFilters.set(filters),
        prefix: PREFIX,
        fields: [
            new SearchField({ key: 'name', type: SearchFieldType.Text }),
            new SearchField({ key: 'age', type: SearchFieldType.Number }),
            new SearchField({ key: 'active', type: SearchFieldType.Boolean }),
            new SearchField({
                key: 'role',
                type: SearchFieldType.Select,
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
