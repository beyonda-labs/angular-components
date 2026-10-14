import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    BeyBooleanFilter,
    BeyFormNumberField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField,
    BeyLinkTableCell,
    BeyModalService,
    BeyPageCategoriesConfig,
    BeyPageComponent,
    BeyPageConfig,
    BeyPageFormConfig,
    BeyPageHandle,
    BeyPageHeaderConfig,
    beyPageOrganizationCell,
    beyPageOrganizationColumn,
    BeyPageOrganizationItem,
    BeyPageOwnedItem,
    beyPageOwnerCell,
    beyPageOwnerColumn,
    BeyPageStandardAction,
    beyPageStandardAction,
    BeyPageTableConfig,
    BeyPageTableSearchConfig,
    BeyPageView,
    BeySearchField,
    BeySearchFieldType,
    BeySearchSortDirection,
    BeyTableColumn,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { STYLE_GUIDE_DOCUMENTS_URL, StyleGuideDocument } from './models/page-backend.model';

const PREFIX = 'angular-components-style-guide.page';
const FOLDERS_PREFIX = `${PREFIX}.folders`;
const SHARING_PREFIX = `${PREFIX}.sharing`;

interface Product extends BeyPageOrganizationItem, BeyPageOwnedItem {
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
    private readonly modalService = inject(BeyModalService);

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
        views: [
            new BeyPageView({ filters: [new BeyBooleanFilter({ field: 'available', value: true })], key: 'available' })
        ],
        tableConfig: new BeyPageTableConfig({
            columns: [
                new BeyTableColumn({ isHideable: false, isSortable: true, key: 'name', width: 4 }),
                new BeyTableColumn({ isSortable: true, key: 'category', width: 3 }),
                new BeyTableColumn({ isSortable: true, key: 'price', width: 2 }),
                beyPageOwnerColumn(),
                beyPageOrganizationColumn()
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
                isOrganizationFilterEnabled: true,
                isOwnerFilterEnabled: true,
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
            categoriesConfig: new BeyPageCategoriesConfig({
                itemCountLabels: { one: `${FOLDERS_PREFIX}.count.one`, other: `${FOLDERS_PREFIX}.count.other` }
            }),
            columns: [
                new BeyTableColumn({ isSortable: true, key: 'name', width: 4 }),
                new BeyTableColumn({ isSortable: true, key: 'price', width: 2 })
            ],
            height: '20rem',
            loadRow: product => this.loadFolderRow(product),
            order: { direction: BeySearchSortDirection.Asc, field: 'name' }
        })
    });
    readonly sharingConfig = new BeyPageConfig<unknown, StyleGuideDocument>({
        baseUrl: STYLE_GUIDE_DOCUMENTS_URL,
        headerConfig: new BeyPageHeaderConfig<StyleGuideDocument>({
            actions: [
                beyPageStandardAction<StyleGuideDocument>(BeyPageStandardAction.View, {
                    action: ([document]) => this.view(document)
                }),
                beyPageStandardAction(BeyPageStandardAction.Share)
            ],
            title: `${SHARING_PREFIX}.title`
        }),
        onReady: handle => (this.sharingPage = handle),
        prefix: SHARING_PREFIX,
        tableConfig: new BeyPageTableConfig<StyleGuideDocument>({
            categoriesConfig: new BeyPageCategoriesConfig<StyleGuideDocument>({
                loadRow: folder => [
                    new BeyLinkTableCell({
                        action: () => this.sharingPage?.openCategory(folder),
                        content: folder.name
                    }),
                    beyPageOwnerCell(folder)
                ]
            }),
            columns: [new BeyTableColumn({ isHideable: false, key: 'name', width: 4 }), beyPageOwnerColumn()],
            height: '20rem',
            isSharedEnabled: true,
            loadRow: document => [
                new BeyLinkTableCell({ action: () => this.view(document), content: document.name }),
                beyPageOwnerCell(document)
            ]
        })
    });

    private sharingPage?: BeyPageHandle<StyleGuideDocument>;

    private loadFolderRow({ name, price }: Product): BeyTextTableCell[] {
        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: toPrice(price) })
        ];
    }

    private loadRow(product: Product): BeyTextTableCell[] {
        const { category, name, price } = product;

        return [
            new BeyTextTableCell({ content: name, tooltip: name }),
            new BeyTextTableCell({ content: category, tooltip: category }),
            new BeyTextTableCell({ content: toPrice(price) }),
            beyPageOwnerCell(product),
            beyPageOrganizationCell(product)
        ];
    }

    private view({ name }: StyleGuideDocument): void {
        this.modalService.openInfo({
            message: `${SHARING_PREFIX}.view.message`,
            messageParameters: { name },
            title: `${SHARING_PREFIX}.view.title`
        });
    }
}

function toPrice(price: number): string {
    return typeof price === 'number' ? `${price.toFixed(2)} €` : '';
}
