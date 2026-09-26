import { BeyFormSection } from '@beyonda-labs/angular-components';

import { buildChoiceSections } from './form-style-guide.choice-sections';
import { buildInputSections } from './form-style-guide.input-sections';

/** Every field type of the form module, one section each: the plain inputs first, then the ones with options. */
export function buildStyleGuideSections(): BeyFormSection[] {
    return [...buildInputSections(), ...buildChoiceSections()];
}
