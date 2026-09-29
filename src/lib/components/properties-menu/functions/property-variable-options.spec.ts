import { PropertyVariable, PropertyVariableType } from './property-variable.model';
import { findVariable, flattenVariables, toVariableExpression, toVariableOptions } from './property-variable-options';

describe('property-variable-options', () => {
    function buildVariables(): PropertyVariable[] {
        return [
            new PropertyVariable({
                id: 'customer',
                label: 'Customer',
                path: 'customer',
                type: PropertyVariableType.Object,
                children: [new PropertyVariable({ id: 'name', label: 'Name', path: 'customer.name' })]
            }),
            new PropertyVariable({ id: 'total', path: 'total', type: PropertyVariableType.Number })
        ];
    }

    it('flattens a variable tree depth first', () => {
        expect(flattenVariables(buildVariables()).map(variable => variable.path)).toEqual([
            'customer',
            'customer.name',
            'total'
        ]);
    });

    it('finds a nested variable by its path', () => {
        expect(findVariable(buildVariables(), 'customer.name')?.label).toBe('Name');
        expect(findVariable(buildVariables(), 'missing')).toBeUndefined();
    });

    it('writes the expression that references a variable', () => {
        expect(toVariableExpression(buildVariables()[1])).toBe('{{ total }}');
    });

    it('builds one picker row per variable, with its depth, path and type', () => {
        expect(toVariableOptions(buildVariables())).toEqual([
            { badge: 'object', depth: 0, description: 'customer', label: 'Customer', value: 'customer' },
            { badge: 'string', depth: 1, description: 'customer.name', label: 'Name', value: 'customer.name' },
            { badge: 'number', depth: 0, description: 'total', label: 'total', value: 'total' }
        ]);
    });
});
