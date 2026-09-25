import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeyPropertiesMenuComponent,
    BeyPropertiesMenuConfig,
    BeyPropertyAttachmentField,
    BeyPropertyAttachmentOption,
    BeyPropertyColorField,
    BeyPropertyFieldsContent,
    BeyPropertyFieldValueChange,
    BeyPropertyGroup,
    BeyPropertyGroupTab,
    BeyPropertyGroupVariant,
    BeyPropertyInfoField,
    BeyPropertyListContent,
    BeyPropertyListItem,
    BeyPropertyListItemSelect,
    BeyPropertyNumberField,
    BeyPropertyOption,
    BeyPropertySegmentedField,
    BeyPropertySelectField,
    BeyPropertyTab,
    BeyPropertyTabsContent,
    BeyPropertyTextField,
    BeyPropertyToggleField,
    BeyPropertyTreeAddBlock,
    BeyPropertyTreeConfig,
    BeyPropertyTreeContent,
    BeyPropertyTreeNode,
    BeyPropertyTreeNodeSelect,
    BeyPropertyVariable,
    BeyPropertyVariableSelection,
    BeyPropertyVariableType
} from '@beyonda-labs/angular-components';
import {
    faAlignCenter,
    faAlignJustify,
    faAlignLeft,
    faAlignRight,
    faBuilding,
    faCalculator,
    faCircleInfo,
    faFile,
    faFileInvoice,
    faFileLines,
    faFont,
    faHeading,
    faImage,
    faLayerGroup,
    faTable
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

const EXAMPLE_VARIABLES: BeyPropertyVariable[] = [
    new BeyPropertyVariable({
        children: [
            new BeyPropertyVariable({
                example: 'John Doe',
                id: 'customer-name',
                label: 'Name',
                path: 'customer.name',
                type: BeyPropertyVariableType.String
            }),
            new BeyPropertyVariable({
                example: 'john@example.com',
                id: 'customer-email',
                label: 'Email',
                path: 'customer.email',
                type: BeyPropertyVariableType.String
            })
        ],
        id: 'customer',
        label: 'Customer',
        path: 'customer',
        type: BeyPropertyVariableType.Object
    }),
    new BeyPropertyVariable({
        children: [
            new BeyPropertyVariable({
                example: 'INV-001',
                id: 'invoice-number',
                label: 'Number',
                path: 'invoice.number',
                type: BeyPropertyVariableType.String
            }),
            new BeyPropertyVariable({
                example: '2026-07-24',
                id: 'invoice-date',
                label: 'Date',
                path: 'invoice.date',
                type: BeyPropertyVariableType.Date
            })
        ],
        id: 'invoice',
        label: 'Invoice',
        path: 'invoice',
        type: BeyPropertyVariableType.Object
    })
];

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

    readonly config = this.buildHeadingConfig();

    provideVariables(): void {
        this.variables.set(EXAMPLE_VARIABLES);
    }

    private buildHeadingConfig(): BeyPropertiesMenuConfig {
        return new BeyPropertiesMenuConfig({
            prefix: 'angular-components-style-guide.properties-menu',
            activeTabId: 'properties',
            icon: faFont,
            onFieldValueChange: change => this.lastFieldChange.set(change),
            onListItemSelect: event => this.lastListItemSelect.set(event),
            onTreeAddBlock: event => this.lastTreeAddBlock.set(event),
            onTreeNodeSelect: event => this.lastTreeNodeSelect.set(event),
            onVariableSelect: selection => this.lastVariableSelection.set(selection),
            subtitle: 'Block: heading',
            tabs: [
                new BeyPropertyTab({
                    id: 'properties',
                    label: 'Properties',
                    groups: [
                        new BeyPropertyGroup({
                            expanded: true,
                            content: new BeyPropertyFieldsContent({
                                fields: [
                                    new BeyPropertyTextField({
                                        acceptsVariable: true,
                                        id: 'text',
                                        label: 'Text',
                                        value: 'INVOICE'
                                    }),
                                    new BeyPropertySegmentedField({
                                        id: 'headingLevel',
                                        label: 'Level',
                                        options: [
                                            new BeyPropertyOption({ label: 'H1', value: 'h1' }),
                                            new BeyPropertyOption({ label: 'H2', value: 'h2' }),
                                            new BeyPropertyOption({ label: 'H3', value: 'h3' }),
                                            new BeyPropertyOption({ label: 'H4', value: 'h4' })
                                        ],
                                        value: 'h2'
                                    }),
                                    new BeyPropertySegmentedField({
                                        id: 'alignment',
                                        label: 'Alignment',
                                        options: [
                                            new BeyPropertyOption({ icon: faAlignLeft, value: 'left' }),
                                            new BeyPropertyOption({ icon: faAlignCenter, value: 'center' }),
                                            new BeyPropertyOption({ icon: faAlignRight, value: 'right' }),
                                            new BeyPropertyOption({ icon: faAlignJustify, value: 'justify' })
                                        ],
                                        value: 'center'
                                    })
                                ]
                            }),
                            id: 'content',
                            label: 'Content'
                        }),
                        new BeyPropertyGroup({
                            expanded: true,
                            content: new BeyPropertyFieldsContent({
                                fields: [
                                    new BeyPropertySelectField({
                                        id: 'fontFamily',
                                        label: 'Font family',
                                        options: [
                                            new BeyPropertyOption({ label: 'Inter', value: 'Inter' }),
                                            new BeyPropertyOption({ label: 'Arial', value: 'Arial' }),
                                            new BeyPropertyOption({ label: 'Georgia', value: 'Georgia' })
                                        ],
                                        value: 'Inter'
                                    }),
                                    new BeyPropertyNumberField({
                                        id: 'fontSize',
                                        label: 'Size',
                                        max: 200,
                                        min: 1,
                                        step: 1,
                                        unit: 'px',
                                        value: 32
                                    }),
                                    new BeyPropertySelectField({
                                        id: 'fontWeight',
                                        label: 'Weight',
                                        options: [
                                            new BeyPropertyOption({ label: 'Regular', value: '400' }),
                                            new BeyPropertyOption({ label: 'Medium', value: '500' }),
                                            new BeyPropertyOption({ label: 'Semibold', value: '600' }),
                                            new BeyPropertyOption({ label: 'Bold', value: '700' })
                                        ],
                                        value: '600'
                                    }),
                                    new BeyPropertyColorField({ id: 'color', label: 'Color', value: '#000000' })
                                ]
                            }),
                            id: 'appearance',
                            label: 'Appearance'
                        }),
                        new BeyPropertyGroup({
                            id: 'spacing',
                            label: 'Spacing',
                            variant: BeyPropertyGroupVariant.SECONDARY
                        }),
                        new BeyPropertyGroup({
                            content: new BeyPropertyFieldsContent({
                                fields: [new BeyPropertyToggleField({ id: 'visible', label: 'Visible', value: true })]
                            }),
                            id: 'visibility',
                            label: 'Visibility',
                            variant: BeyPropertyGroupVariant.SECONDARY
                        }),
                        new BeyPropertyGroup({
                            content: new BeyPropertyTabsContent({
                                tabs: [
                                    new BeyPropertyGroupTab({
                                        id: 'borderTop',
                                        label: 'Top',
                                        fields: [
                                            new BeyPropertyColorField({
                                                id: 'topColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new BeyPropertyNumberField({ id: 'topWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new BeyPropertyGroupTab({
                                        id: 'borderRight',
                                        label: 'Right',
                                        fields: [
                                            new BeyPropertyColorField({
                                                id: 'rightColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new BeyPropertyNumberField({ id: 'rightWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new BeyPropertyGroupTab({
                                        id: 'borderBottom',
                                        label: 'Bottom',
                                        fields: [
                                            new BeyPropertyColorField({
                                                id: 'bottomColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new BeyPropertyNumberField({ id: 'bottomWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new BeyPropertyGroupTab({
                                        id: 'borderLeft',
                                        label: 'Left',
                                        fields: [
                                            new BeyPropertyColorField({
                                                id: 'leftColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new BeyPropertyNumberField({ id: 'leftWidth', label: 'Width', value: 1 })
                                        ]
                                    })
                                ]
                            }),
                            expanded: true,
                            id: 'borders',
                            label: 'Borders',
                            variant: BeyPropertyGroupVariant.SECONDARY
                        }),
                        new BeyPropertyGroup({
                            content: new BeyPropertyFieldsContent({
                                fields: [
                                    new BeyPropertyToggleField({
                                        id: 'bold',
                                        label: 'Bold',
                                        span: 'half',
                                        value: true
                                    }),
                                    new BeyPropertyToggleField({ id: 'underline', label: 'Underline', span: 'half' }),
                                    new BeyPropertyToggleField({ id: 'italic', label: 'Italic', span: 'half' }),
                                    new BeyPropertyToggleField({
                                        id: 'strikethrough',
                                        label: 'Strikethrough',
                                        span: 'half'
                                    }),
                                    new BeyPropertyInfoField({
                                        id: 'scope',
                                        label: 'Scope',
                                        items: [{ label: 'Global', icon: faCircleInfo }, { label: 'text' }]
                                    }),
                                    new BeyPropertySelectField({
                                        id: 'templateId',
                                        label: 'Template',
                                        searchable: true,
                                        value: 'invoice',
                                        options: [
                                            new BeyPropertyOption({ label: 'Factura', value: 'invoice' }),
                                            new BeyPropertyOption({ label: 'Membrete', value: 'letterhead' }),
                                            new BeyPropertyOption({ label: 'Informe', value: 'report' })
                                        ]
                                    }),
                                    new BeyPropertyAttachmentField({
                                        id: 'logo',
                                        label: 'Logo',
                                        accept: 'image/*',
                                        maxSizeBytes: 10 * 1024 * 1024,
                                        value: 'attachment-1',
                                        options: [
                                            new BeyPropertyAttachmentOption({
                                                id: 'attachment-1',
                                                label: 'logo.png',
                                                description: '800 × 600'
                                            }),
                                            new BeyPropertyAttachmentOption({
                                                id: 'attachment-2',
                                                label: 'signature.png',
                                                description: '320 × 120'
                                            })
                                        ]
                                    })
                                ]
                            }),
                            expanded: true,
                            id: 'advanced',
                            label: 'Advanced',
                            variant: BeyPropertyGroupVariant.SECONDARY
                        })
                    ]
                }),
                new BeyPropertyTab({
                    id: 'structure',
                    label: 'Structure',
                    groups: [
                        new BeyPropertyGroup({
                            id: 'structure-tree',
                            showHeader: false,
                            content: new BeyPropertyTreeContent({
                                tree: new BeyPropertyTreeConfig({
                                    addBlockLabel: 'Añadir bloque',
                                    nodes: [
                                        new BeyPropertyTreeNode({
                                            icon: faFile,
                                            id: 'page-1',
                                            label: 'Page 1',
                                            children: [
                                                new BeyPropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'header',
                                                    label: 'Heading',
                                                    children: [
                                                        new BeyPropertyTreeNode({
                                                            icon: faImage,
                                                            id: 'header-image',
                                                            label: 'Image'
                                                        }),
                                                        new BeyPropertyTreeNode({
                                                            icon: faBuilding,
                                                            id: 'header-company-info',
                                                            label: 'Company details'
                                                        })
                                                    ]
                                                }),
                                                new BeyPropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'invoice-section',
                                                    label: 'Section',
                                                    children: [
                                                        new BeyPropertyTreeNode({
                                                            icon: faHeading,
                                                            id: 'invoice-title',
                                                            label: 'Title'
                                                        }),
                                                        new BeyPropertyTreeNode({
                                                            icon: faFileInvoice,
                                                            id: 'invoice-info',
                                                            label: 'Invoice details'
                                                        }),
                                                        new BeyPropertyTreeNode({
                                                            icon: faTable,
                                                            id: 'invoice-products-table',
                                                            label: 'Product table'
                                                        })
                                                    ]
                                                }),
                                                new BeyPropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'totals-section',
                                                    label: 'Section',
                                                    children: [
                                                        new BeyPropertyTreeNode({
                                                            icon: faCalculator,
                                                            id: 'totals',
                                                            label: 'Totals'
                                                        })
                                                    ]
                                                }),
                                                new BeyPropertyTreeNode({
                                                    icon: faFileLines,
                                                    id: 'footer',
                                                    label: 'Footer',
                                                    children: [
                                                        new BeyPropertyTreeNode({
                                                            icon: faAlignLeft,
                                                            id: 'footer-text',
                                                            label: 'Text'
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            })
                        })
                    ]
                }),
                new BeyPropertyTab({
                    id: 'add',
                    label: 'Add',
                    groups: [
                        new BeyPropertyGroup({
                            id: 'simple-blocks',
                            showHeader: false,
                            content: new BeyPropertyListContent({
                                list: [
                                    new BeyPropertyListItem({
                                        description: 'A prominent title or subtitle',
                                        icon: faHeading,
                                        id: 'block-heading',
                                        label: 'Heading'
                                    }),
                                    new BeyPropertyListItem({
                                        description: 'An image or a logo',
                                        icon: faImage,
                                        id: 'block-image',
                                        label: 'Image'
                                    }),
                                    new BeyPropertyListItem({
                                        description: 'A free text paragraph',
                                        icon: faAlignLeft,
                                        id: 'block-text',
                                        label: 'Text'
                                    }),
                                    new BeyPropertyListItem({
                                        description: 'A table of invoice lines',
                                        icon: faTable,
                                        id: 'block-table',
                                        label: 'Product table'
                                    }),
                                    new BeyPropertyListItem({
                                        description: 'Subtotal, taxes and total',
                                        icon: faCalculator,
                                        id: 'block-totals',
                                        label: 'Totals'
                                    })
                                ]
                            })
                        })
                    ]
                })
            ],
            title: 'Título'
        });
    }
}
