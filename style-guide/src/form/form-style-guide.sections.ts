import { Signal } from '@angular/core';
import { BeyFormSection } from '@beyonda-labs/angular-components';

import { buildCheckboxSectionsSection } from './form-style-guide.checkbox-sections';
import { buildChoiceSections } from './form-style-guide.choice-sections';
import { buildDependentSections, StyleGuideRegion } from './form-style-guide.dependent-sections';
import { buildInputSections } from './form-style-guide.input-sections';

export function buildStyleGuideSections(regions: Signal<StyleGuideRegion[]>): BeyFormSection[] {
    return [
        ...buildInputSections(),
        ...buildChoiceSections(),
        buildCheckboxSectionsSection(),
        ...buildDependentSections(regions)
    ];
}
