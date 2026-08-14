import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyInfoField } from './property-info-field.model';

describe('PropertyInfoField', () => {
    it('should fix the field type to "info"', () => {
        expect(new PropertyInfoField({ id: 'scope' }).type).toBe(PropertyFieldType.Info);
    });

    it('should always be disabled, even when constructed as enabled', () => {
        expect(new PropertyInfoField({ id: 'scope', disabled: false }).disabled).toBe(true);
    });

    it('should default to an empty item list', () => {
        expect(new PropertyInfoField({ id: 'scope' }).items).toEqual([]);
    });

    it('should keep the items it was given, icons included', () => {
        const field = new PropertyInfoField({
            id: 'scope',
            items: [{ label: 'Global', icon: faCircleInfo }, { label: 'string' }]
        });

        expect(field.items).toHaveLength(2);
        expect(field.items[0].icon).toBe(faCircleInfo);
        expect(field.items[1].label).toBe('string');
    });
});
