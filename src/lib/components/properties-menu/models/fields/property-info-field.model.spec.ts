import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import { PropertyFieldType } from '../property-field-type.model';
import { PropertyInfoField } from './property-info-field.model';

describe('PropertyInfoField', () => {
    it('fixes the field type to "info"', () => {
        expect(new PropertyInfoField({ id: 'scope' }).type).toBe(PropertyFieldType.Info);
    });

    it('is always disabled, even when built as enabled', () => {
        expect(new PropertyInfoField({ id: 'scope', disabled: false }).disabled).toBe(true);
    });

    it('defaults to an empty item list', () => {
        expect(new PropertyInfoField({ id: 'scope' }).items).toEqual([]);
    });

    it('keeps the items it is given, icons included', () => {
        const field = new PropertyInfoField({
            id: 'scope',
            items: [{ label: 'Global', icon: faCircleInfo }, { label: 'string' }]
        });

        expect(field.items).toHaveLength(2);
        expect(field.items[0].icon).toBe(faCircleInfo);
        expect(field.items[1].label).toBe('string');
    });
});
