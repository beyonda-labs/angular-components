import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

import { PropertyAttachmentField, PropertyAttachmentOption } from '../../models/fields/property-attachment-field.model';
import { PropertyColorField } from '../../models/fields/property-color-field.model';
import { PropertyInfoField } from '../../models/fields/property-info-field.model';
import { PropertyNumberField } from '../../models/fields/property-number-field.model';
import { PropertySegmentedField } from '../../models/fields/property-segmented-field.model';
import { PropertySelectField } from '../../models/fields/property-select-field.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyToggleField } from '../../models/fields/property-toggle-field.model';
import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyGroup, PropertyGroupVariant } from '../../models/property-group.model';
import {
    PropertyFieldsContent,
    PropertyGroupTab,
    PropertyListContent,
    PropertyTabsContent,
    PropertyTreeContent
} from '../../models/property-group-content.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertyOption } from '../../models/property-option.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertyTreeConfig } from '../../models/property-tree-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import { PropertyVariable, PropertyVariableType } from '../../models/property-variable.model';
import { PropertiesMenuComponent } from '../../properties-menu.component';
import {
    PropertyFieldValueChange,
    PropertyListItemSelect,
    PropertyTreeAddBlock,
    PropertyTreeNodeSelect,
    PropertyVariableSelection
} from '../../types/properties-menu-events';

const EXAMPLE_VARIABLES: PropertyVariable[] = [
    new PropertyVariable({
        children: [
            new PropertyVariable({
                example: 'John Doe',
                id: 'customer-name',
                label: 'Name',
                path: 'customer.name',
                type: PropertyVariableType.String
            }),
            new PropertyVariable({
                example: 'john@example.com',
                id: 'customer-email',
                label: 'Email',
                path: 'customer.email',
                type: PropertyVariableType.String
            })
        ],
        id: 'customer',
        label: 'Customer',
        path: 'customer',
        type: PropertyVariableType.Object
    }),
    new PropertyVariable({
        children: [
            new PropertyVariable({
                example: 'INV-001',
                id: 'invoice-number',
                label: 'Number',
                path: 'invoice.number',
                type: PropertyVariableType.String
            }),
            new PropertyVariable({
                example: '2026-07-24',
                id: 'invoice-date',
                label: 'Date',
                path: 'invoice.date',
                type: PropertyVariableType.Date
            })
        ],
        id: 'invoice',
        label: 'Invoice',
        path: 'invoice',
        type: PropertyVariableType.Object
    })
];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PropertiesMenuComponent, TranslateModule],
    selector: 'bey-properties-menu-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './properties-menu-style-guide.component.css'],
    templateUrl: './properties-menu-style-guide.component.html'
})
export class PropertiesMenuStyleGuideComponent {
    readonly lastFieldChange = signal<PropertyFieldValueChange | null>(null);
    readonly lastListItemSelect = signal<PropertyListItemSelect | null>(null);
    readonly lastTreeAddBlock = signal<PropertyTreeAddBlock | null>(null);
    readonly lastTreeNodeSelect = signal<PropertyTreeNodeSelect | null>(null);
    readonly lastVariableSelection = signal<PropertyVariableSelection | null>(null);
    readonly variables = signal<PropertyVariable[]>([]);

    readonly config = this.buildHeadingConfig();

    provideVariables(): void {
        this.variables.set(EXAMPLE_VARIABLES);
    }

    private buildHeadingConfig(): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
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
                new PropertyTab({
                    id: 'properties',
                    label: 'Properties',
                    groups: [
                        new PropertyGroup({
                            expanded: true,
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertyTextField({
                                        acceptsVariable: true,
                                        id: 'text',
                                        label: 'Text',
                                        value: 'INVOICE'
                                    }),
                                    new PropertySegmentedField({
                                        id: 'headingLevel',
                                        label: 'Level',
                                        options: [
                                            new PropertyOption({ label: 'H1', value: 'h1' }),
                                            new PropertyOption({ label: 'H2', value: 'h2' }),
                                            new PropertyOption({ label: 'H3', value: 'h3' }),
                                            new PropertyOption({ label: 'H4', value: 'h4' })
                                        ],
                                        value: 'h2'
                                    }),
                                    new PropertySegmentedField({
                                        id: 'alignment',
                                        label: 'Alignment',
                                        options: [
                                            new PropertyOption({ icon: faAlignLeft, value: 'left' }),
                                            new PropertyOption({ icon: faAlignCenter, value: 'center' }),
                                            new PropertyOption({ icon: faAlignRight, value: 'right' }),
                                            new PropertyOption({ icon: faAlignJustify, value: 'justify' })
                                        ],
                                        value: 'center'
                                    })
                                ]
                            }),
                            id: 'content',
                            label: 'Content'
                        }),
                        new PropertyGroup({
                            expanded: true,
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertySelectField({
                                        id: 'fontFamily',
                                        label: 'Font family',
                                        options: [
                                            new PropertyOption({ label: 'Inter', value: 'Inter' }),
                                            new PropertyOption({ label: 'Arial', value: 'Arial' }),
                                            new PropertyOption({ label: 'Georgia', value: 'Georgia' })
                                        ],
                                        value: 'Inter'
                                    }),
                                    new PropertyNumberField({
                                        id: 'fontSize',
                                        label: 'Size',
                                        max: 200,
                                        min: 1,
                                        step: 1,
                                        unit: 'px',
                                        value: 32
                                    }),
                                    new PropertySelectField({
                                        id: 'fontWeight',
                                        label: 'Weight',
                                        options: [
                                            new PropertyOption({ label: 'Regular', value: '400' }),
                                            new PropertyOption({ label: 'Medium', value: '500' }),
                                            new PropertyOption({ label: 'Semibold', value: '600' }),
                                            new PropertyOption({ label: 'Bold', value: '700' })
                                        ],
                                        value: '600'
                                    }),
                                    new PropertyColorField({ id: 'color', label: 'Color', value: '#000000' })
                                ]
                            }),
                            id: 'appearance',
                            label: 'Appearance'
                        }),
                        new PropertyGroup({
                            id: 'spacing',
                            label: 'Spacing',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyFieldsContent({
                                fields: [new PropertyToggleField({ id: 'visible', label: 'Visible', value: true })]
                            }),
                            id: 'visibility',
                            label: 'Visibility',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyTabsContent({
                                tabs: [
                                    new PropertyGroupTab({
                                        id: 'borderTop',
                                        label: 'Top',
                                        fields: [
                                            new PropertyColorField({
                                                id: 'topColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new PropertyNumberField({ id: 'topWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderRight',
                                        label: 'Right',
                                        fields: [
                                            new PropertyColorField({
                                                id: 'rightColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new PropertyNumberField({ id: 'rightWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderBottom',
                                        label: 'Bottom',
                                        fields: [
                                            new PropertyColorField({
                                                id: 'bottomColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new PropertyNumberField({ id: 'bottomWidth', label: 'Width', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderLeft',
                                        label: 'Left',
                                        fields: [
                                            new PropertyColorField({
                                                id: 'leftColor',
                                                label: 'Color',
                                                value: '#000000'
                                            }),
                                            new PropertyNumberField({ id: 'leftWidth', label: 'Width', value: 1 })
                                        ]
                                    })
                                ]
                            }),
                            expanded: true,
                            id: 'borders',
                            label: 'Borders',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertyToggleField({
                                        id: 'bold',
                                        label: 'Bold',
                                        span: 'half',
                                        value: true
                                    }),
                                    new PropertyToggleField({ id: 'underline', label: 'Underline', span: 'half' }),
                                    new PropertyToggleField({ id: 'italic', label: 'Italic', span: 'half' }),
                                    new PropertyToggleField({
                                        id: 'strikethrough',
                                        label: 'Strikethrough',
                                        span: 'half'
                                    }),
                                    new PropertyInfoField({
                                        id: 'scope',
                                        label: 'Scope',
                                        items: [{ label: 'Global', icon: faCircleInfo }, { label: 'text' }]
                                    }),
                                    new PropertySelectField({
                                        id: 'templateId',
                                        label: 'Template',
                                        searchable: true,
                                        value: 'invoice',
                                        options: [
                                            new PropertyOption({ label: 'Factura', value: 'invoice' }),
                                            new PropertyOption({ label: 'Membrete', value: 'letterhead' }),
                                            new PropertyOption({ label: 'Informe', value: 'report' })
                                        ]
                                    }),
                                    new PropertyAttachmentField({
                                        id: 'logo',
                                        label: 'Logo',
                                        accept: 'image/*',
                                        maxSizeBytes: 10 * 1024 * 1024,
                                        value: 'attachment-1',
                                        options: [
                                            new PropertyAttachmentOption({
                                                id: 'attachment-1',
                                                label: 'logo.png',
                                                description: '800 × 600'
                                            }),
                                            new PropertyAttachmentOption({
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
                            variant: PropertyGroupVariant.SECONDARY
                        })
                    ]
                }),
                new PropertyTab({
                    id: 'structure',
                    label: 'Structure',
                    groups: [
                        new PropertyGroup({
                            id: 'structure-tree',
                            showHeader: false,
                            content: new PropertyTreeContent({
                                tree: new PropertyTreeConfig({
                                    addBlockLabel: 'Añadir bloque',
                                    nodes: [
                                        new PropertyTreeNode({
                                            icon: faFile,
                                            id: 'page-1',
                                            label: 'Page 1',
                                            children: [
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'header',
                                                    label: 'Heading',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faImage,
                                                            id: 'header-image',
                                                            label: 'Image'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faBuilding,
                                                            id: 'header-company-info',
                                                            label: 'Company details'
                                                        })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'invoice-section',
                                                    label: 'Section',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faHeading,
                                                            id: 'invoice-title',
                                                            label: 'Title'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faFileInvoice,
                                                            id: 'invoice-info',
                                                            label: 'Invoice details'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faTable,
                                                            id: 'invoice-products-table',
                                                            label: 'Product table'
                                                        })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'totals-section',
                                                    label: 'Section',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faCalculator,
                                                            id: 'totals',
                                                            label: 'Totals'
                                                        })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faFileLines,
                                                    id: 'footer',
                                                    label: 'Footer',
                                                    children: [
                                                        new PropertyTreeNode({
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
                new PropertyTab({
                    id: 'add',
                    label: 'Add',
                    groups: [
                        new PropertyGroup({
                            id: 'simple-blocks',
                            showHeader: false,
                            content: new PropertyListContent({
                                list: [
                                    new PropertyListItem({
                                        description: 'A prominent title or subtitle',
                                        icon: faHeading,
                                        id: 'block-heading',
                                        label: 'Heading'
                                    }),
                                    new PropertyListItem({
                                        description: 'An image or a logo',
                                        icon: faImage,
                                        id: 'block-image',
                                        label: 'Image'
                                    }),
                                    new PropertyListItem({
                                        description: 'A free text paragraph',
                                        icon: faAlignLeft,
                                        id: 'block-text',
                                        label: 'Text'
                                    }),
                                    new PropertyListItem({
                                        description: 'A table of invoice lines',
                                        icon: faTable,
                                        id: 'block-table',
                                        label: 'Product table'
                                    }),
                                    new PropertyListItem({
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
