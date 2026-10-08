import {
    BeyPropertyAttachmentField,
    BeyPropertyAttachmentOption,
    BeyPropertyColorField,
    BeyPropertyFieldsContent,
    BeyPropertyGroup,
    BeyPropertyGroupTab,
    BeyPropertyGroupVariant,
    BeyPropertyInfoField,
    BeyPropertyNumberField,
    BeyPropertyOption,
    BeyPropertySegmentedField,
    BeyPropertySelectField,
    BeyPropertyTab,
    BeyPropertyTabsContent,
    BeyPropertyTextField,
    BeyPropertyToggleField
} from '@beyonda-labs/angular-components';
import {
    faAlignCenter,
    faAlignJustify,
    faAlignLeft,
    faAlignRight,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';

export function buildPropertiesTab(): BeyPropertyTab {
    return new BeyPropertyTab({
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
    });
}
