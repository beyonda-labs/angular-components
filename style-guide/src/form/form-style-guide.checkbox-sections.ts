import {
    BeyFormCheckboxSection,
    BeyFormCheckboxSectionsField,
    BeyFormRow,
    BeyFormSection
} from '@beyonda-labs/angular-components';
import { faFile, faFileLines, faFolder } from '@fortawesome/free-regular-svg-icons';

const PREFIX = 'angular-components-style-guide.form.section-checkbox-sections';
const RESOURCES = [
    { actions: ['read', 'edit', 'publish', 'delete'], icon: faFileLines, key: 'templates' },
    { actions: ['read', 'create', 'delete'], icon: faFile, key: 'documents' },
    { actions: ['read', 'share'], icon: faFolder, key: 'folders' }
];

export function buildCheckboxSectionsSection(): BeyFormSection {
    const sections = buildSections();

    return new BeyFormSection({
        isTooltipVisible: true,
        key: 'section-checkbox-sections',
        rows: [
            new BeyFormRow({
                fields: [
                    new BeyFormCheckboxSectionsField({ isRequired: true, key: 'sections1', sections }),
                    new BeyFormCheckboxSectionsField({ isDisabled: true, key: 'sections2', sections })
                ]
            })
        ]
    });
}

function buildSections(): BeyFormCheckboxSection[] {
    return RESOURCES.map(({ actions, icon, key }) => ({
        icon,
        key,
        label: `${PREFIX}.${key}.label`,
        options: actions.map(action => ({
            description: action === 'delete' ? undefined : `${PREFIX}.${key}-${action}.description`,
            label: `${PREFIX}.${key}-${action}.label`,
            value: `${key}.${action}`
        }))
    }));
}
