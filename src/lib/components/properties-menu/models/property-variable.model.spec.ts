import { PropertyVariable } from './property-variable.model';

describe('PropertyVariable', () => {
    it('should default label to path when not provided', () => {
        const variable = new PropertyVariable({ id: 'customer', path: 'customer' });

        expect(variable.label).toBe('customer');
        expect(variable.type).toBe('string');
        expect(variable.children).toEqual([]);
    });

    it('should transform nested children into PropertyVariable instances', () => {
        const variable = new PropertyVariable({
            id: 'customer',
            path: 'customer',
            children: [new PropertyVariable({ id: 'customer-name', path: 'customer.name', label: 'Nombre' })]
        });

        expect(variable.children[0]).toBeInstanceOf(PropertyVariable);
        expect(variable.children[0].path).toBe('customer.name');
    });
});
