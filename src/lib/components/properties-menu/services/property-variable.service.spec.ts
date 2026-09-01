import { PropertyVariable } from '../models/property-variable.model';
import { PropertyVariableService } from './property-variable.service';

describe('PropertyVariableService', () => {
    let service: PropertyVariableService;

    beforeEach(() => {
        service = new PropertyVariableService();
    });

    it('should start with an empty list', () => {
        expect(service.variables()).toEqual([]);
    });

    it('should transform configs into PropertyVariable instances', () => {
        service.setVariables([{ id: 'customer', path: 'customer' }]);

        expect(service.getVariables()[0]).toBeInstanceOf(PropertyVariable);
    });

    it('should accept PropertyVariable instances as-is', () => {
        const variable = new PropertyVariable({ id: 'customer', path: 'customer' });

        service.setVariables([variable]);

        expect(service.getVariables()[0]).toBe(variable);
    });

    it('should clear all variables', () => {
        service.setVariables([{ id: 'customer', path: 'customer' }]);
        service.clearVariables();

        expect(service.getVariables()).toEqual([]);
    });

    it('should find a variable by path across the whole tree', () => {
        service.setVariables([
            {
                id: 'customer',
                path: 'customer',
                children: [new PropertyVariable({ id: 'customer-name', path: 'customer.name' })]
            }
        ]);

        expect(service.findByPath('customer.name')?.id).toBe('customer-name');
        expect(service.findByPath('missing')).toBeUndefined();
    });

    it('should flatten nested variables into a single list', () => {
        service.setVariables([
            {
                id: 'customer',
                path: 'customer',
                children: [
                    new PropertyVariable({ id: 'customer-name', path: 'customer.name' }),
                    new PropertyVariable({ id: 'customer-email', path: 'customer.email' })
                ]
            },
            { id: 'invoice', path: 'invoice' }
        ]);

        expect(service.flattenVariables().map(variable => variable.path)).toEqual([
            'customer',
            'customer.name',
            'customer.email',
            'invoice'
        ]);
    });
});
