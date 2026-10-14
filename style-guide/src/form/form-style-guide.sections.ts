import { Signal } from '@angular/core';
import { BeyFormSection } from '@beyonda-labs/angular-components';

import { buildCheckboxSectionsSection } from './form-style-guide.checkbox-sections';
import { buildChoiceSections } from './form-style-guide.choice-sections';
import { buildDependentSections } from './form-style-guide.dependent-sections';
import { buildInputSections } from './form-style-guide.input-sections';
import { buildListSections } from './form-style-guide.list-sections';
import { StyleGuideRegion } from './models/form-style-guide.model';

export function buildStyleGuideSections(
    regions: Signal<StyleGuideRegion[]>,
    onAutocompletePick: () => void
): BeyFormSection[] {
    return [
        ...buildInputSections(),
        ...buildChoiceSections(onAutocompletePick),
        ...buildListSections(),
        buildCheckboxSectionsSection(),
        ...buildDependentSections(regions)
    ];
}
