import {
    BeyPropertiesMenuConfig,
    BeyPropertiesMenuConfigParameters,
    BeyPropertyGroup,
    BeyPropertyListContent,
    BeyPropertyListItem,
    BeyPropertyTab,
    BeyPropertyTreeConfig,
    BeyPropertyTreeContent,
    BeyPropertyTreeNode
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
                        isHeaderShown: false,
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
                                                isExpanded: false,
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
                                                isExpanded: false,
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
                                                isExpanded: false,
                                                icon: faLayerGroup,
                                                id: 'totals-section',
                                                label: 'Section',
                                                children: [
                                                    new BeyPropertyTreeNode({
                                                        isActive: true,
                                                        icon: faCalculator,
                                                        id: 'totals',
                                                        label: 'Totals'
                                                    })
                                                ]
                                            }),
                                            new BeyPropertyTreeNode({
                                                isExpanded: false,
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
                        isHeaderShown: false,
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
