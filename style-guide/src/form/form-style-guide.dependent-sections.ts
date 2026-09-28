import { Signal } from '@angular/core';
import {
    BeyFormAutocompleteField,
    BeyFormFieldOption,
    BeyFormNumberField,
    BeyFormRow,
    BeyFormSection,
    BeyFormSelectField,
    BeyFormValue
} from '@beyonda-labs/angular-components';

const PREFIX = 'angular-components-style-guide.form.section-dependent';
const SECTION_KEY = 'section-dependent';

export interface StyleGuideRegion {
    isProOnly: boolean;
    key: string;
}

export const STYLE_GUIDE_REGIONS: StyleGuideRegion[] = [
    { isProOnly: false, key: 'eu' },
    { isProOnly: true, key: 'us' },
    { isProOnly: true, key: 'asia' }
];

export function buildDependentSections(regions: Signal<StyleGuideRegion[]>): BeyFormSection[] {
    return [
        new BeyFormSection({
            key: SECTION_KEY,
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormSelectField({
                            key: 'plan',
                            columns: 4,
                            options: ['free', 'pro'].map(plan => ({
                                label: `${PREFIX}.plan.options.${plan}`,
                                value: plan
                            }))
                        }),
                        new BeyFormNumberField({
                            key: 'seats',
                            columns: 4,
                            isRequired: value => planOf(value) === 'pro',
                            min: 1
                        }),
                        new BeyFormAutocompleteField({
                            key: 'region',
                            columns: 4,
                            options: value => regionOptions(regions(), planOf(value))
                        })
                    ]
                })
            ]
        })
    ];
}

function planOf(value: BeyFormValue): unknown {
    return value[SECTION_KEY]?.['plan'];
}

function regionOptions(regions: StyleGuideRegion[], plan: unknown): BeyFormFieldOption[] {
    if (!plan) {
        return [];
    }

    return regions
        .filter(region => plan === 'pro' || !region.isProOnly)
        .map(region => ({ label: `${PREFIX}.region.options.${region.key}`, value: region.key }));
}
