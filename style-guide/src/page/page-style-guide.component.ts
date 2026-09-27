import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    BeyFormNumberField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyHeaderActionType,
    BeyPageAction,
    BeyPageActionScope,
    BeyPageActionZone,
    BeyPageComponent,
    BeyPageConfig,
    BeyPageFormConfig,
    BeyPageHeaderConfig,
    BeyPageItem,
    BeyPageStandardAction,
    BeyPageTableConfig,
    BeyPageTableSearchConfig,
    BeySearchField,
    BeySearchFieldType,
    BeySearchSortDirection,
    BeyTableColumn,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.page';

interface Product extends BeyPageItem {
    category: string;
    name: string;
    price: number;
}

interface ProductFormValue {
    product: { category: string; name: string; price: number | null };
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyPageComponent, TranslateModule],
    selector: 'bey-page-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './page-style-guide.component.html'
})
export class PageStyleGuideComponent {
    readonly config = new BeyPageConfig<ProductFormValue>({
        baseUrl: '/products',
        formConfig: new BeyPageFormConfig<ProductFormValue>({
            buildSections: () => [
                new BeyFormSection({
                    isTitleVisible: false,
                    key: 'product',
                    rows: [
                        new BeyFormRow({
                            fields: [
                                new BeyFormTextField({ columns: 6, isRequired: true, key: 'name' }),
                                new BeyFormTextField({ columns: 6, isRequired: true, key: 'category' })
                            ]
                        }),
                        new BeyFormRow({
                            fields: [new BeyFormNumberField({ columns: 6, isRequired: true, key: 'price', min: 0 })]
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
            toItem: value => value.product
        }),
        headerConfig: new BeyPageHeaderConfig({
            actions: [
                new BeyPageAction({
                    icon: faPlus,
                    key: BeyPageStandardAction.Create,
                    scope: BeyPageActionScope.Global,
                    type: BeyHeaderActionType.PrimaryButton,
                    zone: BeyPageActionZone.Right
                }),
                new BeyPageAction({
                    key: BeyPageStandardAction.Edit,
                    scope: BeyPageActionScope.Item,
                    zone: BeyPageActionZone.Left
                }),
                new BeyPageAction({
                    key: BeyPageStandardAction.Delete,
                    scope: BeyPageActionScope.Item,
                    zone: BeyPageActionZone.Menu
                })
            ],
            title: `${PREFIX}.title`
        }),
        prefix: PREFIX,
        tableConfig: new BeyPageTableConfig({
            columns: [
                new BeyTableColumn({ key: 'name', width: 4 }),
                new BeyTableColumn({ key: 'category', width: 3 }),
                new BeyTableColumn({ key: 'price', width: 2 })
            ],
            height: '24rem',
            loadRow: item => this.loadRow(item as Product),
            order: { direction: BeySearchSortDirection.Asc, field: 'name' },
            search: new BeyPageTableSearchConfig({
                fields: [
                    new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
                    new BeySearchField({ key: 'category', type: BeySearchFieldType.Text }),
                    new BeySearchField({ key: 'price', type: BeySearchFieldType.Number })
                ],
                mainField: 'name'
            })
        })
    });

    private loadRow({ category, name, price }: Product): BeyTextTableCell[] {
        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: category, tooltip: category }),
            new BeyTextTableCell({ content: typeof price === 'number' ? `${price.toFixed(2)} €` : '' })
        ];
    }
}
