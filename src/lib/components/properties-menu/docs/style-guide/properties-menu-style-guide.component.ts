import { Component, ViewChild } from '@angular/core';
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

import { PropertyAttachmentField } from '../../models/fields/property-attachment-field.model';
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
import { PropertyTab } from '../../models/property-tab.model';
import { PropertyTreeConfig } from '../../models/property-tree-config.model';
import { PropertyTreeNode } from '../../models/property-tree-node.model';
import {
    PropertyVariable,
    PropertyVariableParameters,
    PropertyVariableType
} from '../../models/property-variable.model';
import { PropertiesMenuComponent } from '../../properties-menu.component';
import {
    PropertyFieldValueChange,
    PropertyListItemSelect,
    PropertyTreeAddBlock,
    PropertyTreeNodeSelect,
    PropertyVariableSelection
} from '../../types/properties-menu-events';

const EXAMPLE_VARIABLES: PropertyVariableParameters[] = [
    {
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
    },
    {
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
    }
];

@Component({
    imports: [PropertiesMenuComponent, TranslateModule],
    selector: 'bey-properties-menu-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './properties-menu-style-guide.component.css'],
    templateUrl: './properties-menu-style-guide.component.html'
})
export class PropertiesMenuStyleGuideComponent {
    @ViewChild(PropertiesMenuComponent) propertiesMenu!: PropertiesMenuComponent;

    readonly headingConfig = this.buildHeadingConfig();

    lastFieldChange: PropertyFieldValueChange | null = null;
    lastListItemSelect: PropertyListItemSelect | null = null;
    lastTreeAddBlock: PropertyTreeAddBlock | null = null;
    lastTreeNodeSelect: PropertyTreeNodeSelect | null = null;
    lastVariableSelection: PropertyVariableSelection | null = null;

    onFieldValueChange(change: PropertyFieldValueChange): void {
        this.lastFieldChange = change;
    }

    onListItemSelect(event: PropertyListItemSelect): void {
        this.lastListItemSelect = event;
    }

    onTreeAddBlock(event: PropertyTreeAddBlock): void {
        this.lastTreeAddBlock = event;
    }

    onTreeNodeSelect(event: PropertyTreeNodeSelect): void {
        this.lastTreeNodeSelect = event;
    }

    onVariableSelected(selection: PropertyVariableSelection): void {
        this.lastVariableSelection = selection;
    }

    provideVariables(): void {
        this.propertiesMenu.setVariables(EXAMPLE_VARIABLES);
    }

    private buildHeadingConfig(): PropertiesMenuConfig {
        return new PropertiesMenuConfig({
            prefix: 'angular-components-style-guide.propertiesMenu',
            activeTabId: 'properties',
            icon: faFont,
            subtitle: 'Bloque: heading',
            tabs: [
                new PropertyTab({
                    id: 'properties',
                    label: 'Propiedades',
                    groups: [
                        new PropertyGroup({
                            expanded: true,
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertyTextField({
                                        acceptsVariable: true,
                                        id: 'text',
                                        label: 'Texto',
                                        value: 'FACTURA'
                                    }),
                                    new PropertySegmentedField({
                                        id: 'headingLevel',
                                        label: 'Nivel',
                                        options: [
                                            { label: 'H1', value: 'h1' },
                                            { label: 'H2', value: 'h2' },
                                            { label: 'H3', value: 'h3' },
                                            { label: 'H4', value: 'h4' }
                                        ],
                                        value: 'h2'
                                    }),
                                    new PropertySegmentedField({
                                        id: 'alignment',
                                        label: 'Alineación',
                                        options: [
                                            { icon: faAlignLeft, value: 'left' },
                                            { icon: faAlignCenter, value: 'center' },
                                            { icon: faAlignRight, value: 'right' },
                                            { icon: faAlignJustify, value: 'justify' }
                                        ],
                                        value: 'center'
                                    })
                                ]
                            }),
                            id: 'content',
                            label: 'Contenido'
                        }),
                        new PropertyGroup({
                            expanded: true,
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertySelectField({
                                        id: 'fontFamily',
                                        label: 'Tipografía',
                                        options: [
                                            { label: 'Inter', value: 'Inter' },
                                            { label: 'Arial', value: 'Arial' },
                                            { label: 'Georgia', value: 'Georgia' }
                                        ],
                                        value: 'Inter'
                                    }),
                                    new PropertyNumberField({
                                        id: 'fontSize',
                                        label: 'Tamaño',
                                        max: 200,
                                        min: 1,
                                        step: 1,
                                        unit: 'px',
                                        value: 32
                                    }),
                                    new PropertySelectField({
                                        id: 'fontWeight',
                                        label: 'Peso',
                                        options: [
                                            { label: 'Regular', value: '400' },
                                            { label: 'Medium', value: '500' },
                                            { label: 'Semibold', value: '600' },
                                            { label: 'Bold', value: '700' }
                                        ],
                                        value: '600'
                                    }),
                                    new PropertyColorField({ id: 'color', label: 'Color', value: '#000000' })
                                ]
                            }),
                            id: 'appearance',
                            label: 'Apariencia'
                        }),
                        new PropertyGroup({
                            id: 'spacing',
                            label: 'Espaciado',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyFieldsContent({
                                fields: [new PropertyToggleField({ id: 'visible', label: 'Visible', value: true })]
                            }),
                            id: 'visibility',
                            label: 'Visibilidad',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyTabsContent({
                                tabs: [
                                    new PropertyGroupTab({
                                        id: 'borderTop',
                                        label: 'Arriba',
                                        fields: [
                                            new PropertyColorField({ id: 'topColor', label: 'Color', value: '#000000' }),
                                            new PropertyNumberField({ id: 'topWidth', label: 'Grosor', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderRight',
                                        label: 'Derecha',
                                        fields: [
                                            new PropertyColorField({ id: 'rightColor', label: 'Color', value: '#000000' }),
                                            new PropertyNumberField({ id: 'rightWidth', label: 'Grosor', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderBottom',
                                        label: 'Abajo',
                                        fields: [
                                            new PropertyColorField({ id: 'bottomColor', label: 'Color', value: '#000000' }),
                                            new PropertyNumberField({ id: 'bottomWidth', label: 'Grosor', value: 1 })
                                        ]
                                    }),
                                    new PropertyGroupTab({
                                        id: 'borderLeft',
                                        label: 'Izquierda',
                                        fields: [
                                            new PropertyColorField({ id: 'leftColor', label: 'Color', value: '#000000' }),
                                            new PropertyNumberField({ id: 'leftWidth', label: 'Grosor', value: 1 })
                                        ]
                                    })
                                ]
                            }),
                            expanded: true,
                            id: 'borders',
                            label: 'Bordes',
                            variant: PropertyGroupVariant.SECONDARY
                        }),
                        new PropertyGroup({
                            content: new PropertyFieldsContent({
                                fields: [
                                    new PropertyToggleField({ id: 'bold', label: 'Negrita', span: 'half', value: true }),
                                    new PropertyToggleField({ id: 'underline', label: 'Subrayado', span: 'half' }),
                                    new PropertyToggleField({ id: 'italic', label: 'Cursiva', span: 'half' }),
                                    new PropertyToggleField({ id: 'strikethrough', label: 'Tachado', span: 'half' }),
                                    new PropertyInfoField({
                                        id: 'scope',
                                        label: 'Ámbito',
                                        items: [{ label: 'Global', icon: faCircleInfo }, { label: 'texto' }]
                                    }),
                                    new PropertySelectField({
                                        id: 'templateId',
                                        label: 'Plantilla',
                                        searchable: true,
                                        value: 'invoice',
                                        options: [
                                            { label: 'Factura', value: 'invoice' },
                                            { label: 'Membrete', value: 'letterhead' },
                                            { label: 'Informe', value: 'report' }
                                        ]
                                    }),
                                    new PropertyAttachmentField({
                                        id: 'logo',
                                        label: 'Logotipo',
                                        accept: 'image/*',
                                        maxSizeBytes: 10 * 1024 * 1024,
                                        value: 'attachment-1',
                                        options: [
                                            { id: 'attachment-1', label: 'logo.png', description: '800 × 600' },
                                            { id: 'attachment-2', label: 'firma.png', description: '320 × 120' }
                                        ]
                                    })
                                ]
                            }),
                            expanded: true,
                            id: 'advanced',
                            label: 'Avanzado',
                            variant: PropertyGroupVariant.SECONDARY
                        })
                    ]
                }),
                new PropertyTab({
                    id: 'structure',
                    label: 'Estructura',
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
                                            label: 'Página 1',
                                            children: [
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'header',
                                                    label: 'Encabezado',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faImage,
                                                            id: 'header-image',
                                                            label: 'Imagen'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faBuilding,
                                                            id: 'header-company-info',
                                                            label: 'Información de la empresa'
                                                        })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'invoice-section',
                                                    label: 'Sección',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faHeading,
                                                            id: 'invoice-title',
                                                            label: 'Título'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faFileInvoice,
                                                            id: 'invoice-info',
                                                            label: 'Información de la factura'
                                                        }),
                                                        new PropertyTreeNode({
                                                            icon: faTable,
                                                            id: 'invoice-products-table',
                                                            label: 'Tabla de productos'
                                                        })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faLayerGroup,
                                                    id: 'totals-section',
                                                    label: 'Sección',
                                                    children: [
                                                        new PropertyTreeNode({ icon: faCalculator, id: 'totals', label: 'Totales' })
                                                    ]
                                                }),
                                                new PropertyTreeNode({
                                                    icon: faFileLines,
                                                    id: 'footer',
                                                    label: 'Pie de página',
                                                    children: [
                                                        new PropertyTreeNode({
                                                            icon: faAlignLeft,
                                                            id: 'footer-text',
                                                            label: 'Texto'
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
                    label: 'Añadir',
                    groups: [
                        new PropertyGroup({
                            id: 'simple-blocks',
                            showHeader: false,
                            content: new PropertyListContent({
                                list: [
                                    new PropertyListItem({
                                        description: 'Título o subtítulo destacado',
                                        icon: faHeading,
                                        id: 'block-heading',
                                        label: 'Encabezado'
                                    }),
                                    new PropertyListItem({
                                        description: 'Imagen o logotipo',
                                        icon: faImage,
                                        id: 'block-image',
                                        label: 'Imagen'
                                    }),
                                    new PropertyListItem({
                                        description: 'Párrafo de texto libre',
                                        icon: faAlignLeft,
                                        id: 'block-text',
                                        label: 'Texto'
                                    }),
                                    new PropertyListItem({
                                        description: 'Tabla de líneas de factura',
                                        icon: faTable,
                                        id: 'block-table',
                                        label: 'Tabla de productos'
                                    }),
                                    new PropertyListItem({
                                        description: 'Subtotal, impuestos y total',
                                        icon: faCalculator,
                                        id: 'block-totals',
                                        label: 'Totales'
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
