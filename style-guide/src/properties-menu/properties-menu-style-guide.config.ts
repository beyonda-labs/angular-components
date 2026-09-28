import {
    BeyPropertiesMenuConfig,
    BeyPropertiesMenuConfigParameters,
    BeyPropertyGroup,
    BeyPropertyListContent,
    BeyPropertyListItem,
    BeyPropertyTab,
    BeyPropertyTreeConfig,
    BeyPropertyTreeContent,
    BeyPropertyTreeNode,
    BeyPropertyVariable,
    BeyPropertyVariableType
} from '@beyonda-labs/angular-components';
import {
    faAlignLeft,
    faBuilding,
    faCalculator,
    faFile,
    faFileInvoice,
    faFileLines,
    faFont,
    faHeading,
    faImage,
    faLayerGroup,
    faTable
} from '@fortawesome/free-solid-svg-icons';

import { buildPropertiesTab } from './properties-menu-style-guide.properties-tab';

export const EXAMPLE_VARIABLES: BeyPropertyVariable[] = [
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

/** The demo config: a heading block with the properties, structure and add tabs. */
export function buildPropertiesMenuConfig(
    callbacks: Pick<
        BeyPropertiesMenuConfigParameters,
        'onFieldValueChange' | 'onListItemSelect' | 'onTreeAddBlock' | 'onTreeNodeSelect' | 'onVariableSelect'
    >
): BeyPropertiesMenuConfig {
    return new BeyPropertiesMenuConfig({
        ...callbacks,
        prefix: 'angular-components-style-guide.properties-menu',
        activeTabId: 'properties',
        icon: faFont,
        subtitle: 'Block: heading',
        tabs: [
            buildPropertiesTab(),
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
                                        label: 'angular-components-style-guide.properties-menu.tree.page',
                                        labelParameters: { number: 1 },
                                        children: [
                                            new BeyPropertyTreeNode({
                                                expanded: false,
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
                                                expanded: false,
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
                                                expanded: false,
                                                icon: faLayerGroup,
                                                id: 'totals-section',
                                                label: 'Section',
                                                children: [
                                                    new BeyPropertyTreeNode({
                                                        active: true,
                                                        icon: faCalculator,
                                                        id: 'totals',
                                                        label: 'Totals'
                                                    })
                                                ]
                                            }),
                                            new BeyPropertyTreeNode({
                                                expanded: false,
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
