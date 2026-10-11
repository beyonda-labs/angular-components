import {
    FORM_CHECKBOX_SECTIONS_TEXTS as TEXTS,
    FormCheckboxSection,
    FormCheckboxSectionOption,
    FormCheckboxSectionsViewOptions,
    FormCheckboxSectionView
} from '../../../models/fields/form-checkbox-sections-field.model';

export function checkboxSectionViews(
    sections: FormCheckboxSection[],
    { expandedKeys, fieldKey, isDisabled, values }: FormCheckboxSectionsViewOptions
): FormCheckboxSectionView[] {
    const checked = new Set(values);

    return sections.map(section => {
        const baseId = `${fieldKey}_${section.key}`;
        const bodyId = `${baseId}_options`;
        const checkedCount = section.options.filter(({ value }) => checked.has(value)).length;
        const enabled = enabledOptionsOf(section, isDisabled);
        const isAllChecked = enabled.length > 0 && enabled.every(({ value }) => checked.has(value));
        const isExpanded = expandedKeys.has(section.key);

        return {
            bodyId,
            checkedCount,
            controlsId: isExpanded ? bodyId : null,
            countParameters: { checked: checkedCount, total: section.options.length },
            hasToggleAll: enabled.length > 0,
            icon: section.icon,
            isAllChecked,
            isExpanded,
            key: section.key,
            label: section.label,
            options: section.options.map(option => {
                const id = `${fieldKey}_${option.value}`;

                return {
                    description: option.description,
                    descriptionId: `${id}_description`,
                    id,
                    isChecked: checked.has(option.value),
                    isDisabled: isDisabled || (option.isDisabled ?? false),
                    label: option.label,
                    value: option.value
                };
            }),
            titleId: `${baseId}_title`,
            toggleAllLabel: isAllChecked ? TEXTS.clearAll : TEXTS.selectAll,
            toggleAllName: isAllChecked ? TEXTS.clearAllIn : TEXTS.selectAllIn,
            total: section.options.length
        };
    });
}

export function toggleOptionValues(
    sections: FormCheckboxSection[],
    values: string[],
    value: string,
    isChecked: boolean
): string[] {
    const checked = new Set(values);

    if (isChecked) {
        checked.add(value);
    } else {
        checked.delete(value);
    }

    return orderedValues(sections, values, checked);
}

export function toggleSectionValues(
    sections: FormCheckboxSection[],
    values: string[],
    sectionKey: string,
    isChecked: boolean
): string[] {
    const section = sections.find(({ key }) => key === sectionKey);
    const checked = new Set(values);

    for (const { value } of section ? enabledOptionsOf(section, false) : []) {
        if (isChecked) {
            checked.add(value);
        } else {
            checked.delete(value);
        }
    }

    return orderedValues(sections, values, checked);
}

function enabledOptionsOf(section: FormCheckboxSection, isDisabled: boolean): FormCheckboxSectionOption[] {
    return isDisabled ? [] : section.options.filter(option => !option.isDisabled);
}

function orderedValues(sections: FormCheckboxSection[], previous: string[], checked: Set<string>): string[] {
    const offered = sections.flatMap(({ options }) => options.map(({ value }) => value));
    const offeredSet = new Set(offered);

    return [
        ...new Set([
            ...offered.filter(value => checked.has(value)),
            ...previous.filter(value => !offeredSet.has(value) && checked.has(value))
        ])
    ];
}
