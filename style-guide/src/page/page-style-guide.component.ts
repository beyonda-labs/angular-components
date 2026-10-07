import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    BeyFormNumberField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyPageCategoriesConfig,
    BeyPageComponent,
    BeyPageConfig,
    BeyPageFormConfig,
    BeyPageHeaderConfig,
    BeyPageItem,
    BeyPageStandardAction,
    beyPageStandardAction,
    BeyPageTableConfig,
    BeyPageTableSearchConfig,
    BeySearchField,
    BeySearchFieldType,
    BeySearchSortDirection,
    BeyTableColumn,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

const PREFIX = 'angular-components-style-guide.page';
const FOLDERS_PREFIX = `${PREFIX}.folders`;

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
    readonly config = new BeyPageConfig<ProductFormValue, Product>({
        baseUrl: '/products',
        formConfig: new BeyPageFormConfig<ProductFormValue, Product>({
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
            toFormValue: product =>
                product
                    ? { product: { category: product.category, name: product.name, price: product.price } }
                    : undefined,
            toItem: value => value.product
        }),
        headerConfig: new BeyPageHeaderConfig({
            actions: [
                beyPageStandardAction(BeyPageStandardAction.Create),
                beyPageStandardAction(BeyPageStandardAction.Edit),
                beyPageStandardAction(BeyPageStandardAction.Delete)
            ],
            title: `${PREFIX}.title`
        }),
        prefix: PREFIX,
        tableConfig: new BeyPageTableConfig({
            columns: [
                new BeyTableColumn({ isHideable: false, isSortable: true, key: 'name', width: 4 }),
                new BeyTableColumn({ isSortable: true, key: 'category', width: 3 }),
                new BeyTableColumn({ isSortable: true, key: 'price', width: 2 })
            ],
            height: '24rem',
            loadRow: product => this.loadRow(product),
            order: { direction: BeySearchSortDirection.Asc, field: 'name' },
            search: new BeyPageTableSearchConfig({
                fields: [
                    new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
                    new BeySearchField({ key: 'category', type: BeySearchFieldType.Text }),
                    new BeySearchField({ key: 'price', type: BeySearchFieldType.Number })
                ],
                mainField: 'name'
            }),
            storageKey: 'style-guide-products'
        })
    });
    readonly foldersConfig = new BeyPageConfig<unknown, Product>({
        baseUrl: '/product-categories',
        headerConfig: new BeyPageHeaderConfig({
            actions: [beyPageStandardAction(BeyPageStandardAction.Move)],
            title: `${FOLDERS_PREFIX}.title`
        }),
        prefix: FOLDERS_PREFIX,
        tableConfig: new BeyPageTableConfig({
            categoriesConfig: new BeyPageCategoriesConfig({}),
            columns: [
                new BeyTableColumn({ isSortable: true, key: 'name', width: 4 }),
                new BeyTableColumn({ isSortable: true, key: 'price', width: 2 })
            ],
            height: '20rem',
            loadRow: product => this.loadFolderRow(product),
            order: { direction: BeySearchSortDirection.Asc, field: 'name' }
        })
    });

    private loadFolderRow({ name, price }: Product): BeyTextTableCell[] {
        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: toPrice(price) })
        ];
    }

    private loadRow({ category, name, price }: Product): BeyTextTableCell[] {
        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: category, tooltip: category }),
            new BeyTextTableCell({ content: toPrice(price) })
        ];
    }
}

function toPrice(price: number): string {
    return typeof price === 'number' ? `${price.toFixed(2)} €` : '';
}
