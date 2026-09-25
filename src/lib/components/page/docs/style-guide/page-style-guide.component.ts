import { ChangeDetectionStrategy, Component } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormNumberField } from '../../../form/models/fields/form-number-field.model';
import { FormTextField } from '../../../form/models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../form/models/form.model';
import { HeaderActionType } from '../../../header/models/header.model';
import { SearchField, SearchFieldType } from '../../../search/models/search.model';
import { TableColumn } from '../../../table/models/table.model';
import { TextTableCell } from '../../../table/models/table-cell.model';
import { PageConfig } from '../../models/page.model';
import { PageAction, PageActionScope, PageActionZone, PageStandardAction } from '../../models/page-action.model';
import { PageFormConfig } from '../../models/page-form.model';
import { PageHeaderConfig } from '../../models/page-header.model';
import { PageItem } from '../../models/page-item.model';
import { SearchSortDirection } from '../../models/page-search.model';
import { PageTableConfig, PageTableSearchConfig } from '../../models/page-table.model';
import { PageComponent } from '../../page.component';

const PREFIX = 'angular-components-style-guide.page';

interface Product extends PageItem {
    category: string;
    name: string;
    price: number;
}

interface ProductFormValue {
    product: { category: string; name: string; price: number | null };
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageComponent, TranslateModule],
    selector: 'bey-page-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './page-style-guide.component.html'
})
export class PageStyleGuideComponent {
    readonly config = new PageConfig({
        baseUrl: '/products',
        formConfig: new PageFormConfig<unknown>({
            buildSections: () => [
                new FormSection({
                    isTitleVisible: false,
                    key: 'product',
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({ columns: 6, isRequired: true, key: 'name' }),
                                new FormTextField({ columns: 6, isRequired: true, key: 'category' })
                            ]
                        }),
                        new FormRow({
                            fields: [new FormNumberField({ columns: 6, isRequired: true, key: 'price', min: 0 })]
                        })
                    ]
                })
            ],
            prefix: `${PREFIX}.form`,
            toFormValue: item => {
                const product = item as Product | undefined;

                return product
                    ? { product: { category: product.category, name: product.name, price: product.price } }
                    : undefined;
            },
            toItem: value => (value as ProductFormValue).product
        }),
        headerConfig: new PageHeaderConfig({
            actions: [
                new PageAction({
                    icon: faPlus,
                    key: PageStandardAction.Create,
                    scope: PageActionScope.Global,
                    type: HeaderActionType.PrimaryButton,
                    zone: PageActionZone.Right
                }),
                new PageAction({
                    key: PageStandardAction.Edit,
                    scope: PageActionScope.Item,
                    zone: PageActionZone.Left
                }),
                new PageAction({
                    key: PageStandardAction.Delete,
                    scope: PageActionScope.Item,
                    zone: PageActionZone.Menu
                })
            ],
            title: `${PREFIX}.title`
        }),
        prefix: PREFIX,
        tableConfig: new PageTableConfig({
            columns: [
                new TableColumn({ key: 'name', width: 4 }),
                new TableColumn({ key: 'category', width: 3 }),
                new TableColumn({ key: 'price', width: 2 })
            ],
            height: '24rem',
            loadRow: item => this.loadRow(item as Product),
            order: { direction: SearchSortDirection.Asc, field: 'name' },
            search: new PageTableSearchConfig({
                fields: [
                    new SearchField({ key: 'name', type: SearchFieldType.Text }),
                    new SearchField({ key: 'category', type: SearchFieldType.Text }),
                    new SearchField({ key: 'price', type: SearchFieldType.Number })
                ],
                mainField: 'name'
            })
        })
    });

    private loadRow({ category, name, price }: Product): TextTableCell[] {
        return [
            new TextTableCell({ content: name, tooltip: name }),
            new TextTableCell({ content: category, tooltip: category }),
            new TextTableCell({ content: typeof price === 'number' ? `${price.toFixed(2)} €` : '' })
        ];
    }
}
