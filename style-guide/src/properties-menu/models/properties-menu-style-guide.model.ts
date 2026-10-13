import { BeyPropertyVariable, BeyPropertyVariableType } from '@beyonda-labs/angular-components';

export const EXAMPLE_VARIABLES: BeyPropertyVariable[] = [
    new BeyPropertyVariable({
        children: [
            new BeyPropertyVariable({
                example: 'John Doe',
                id: 'customer-name',
                label: 'Name',
                path: 'customer.name',
                type: BeyPropertyVariableType.String
            }),
            new BeyPropertyVariable({
                example: 'john@example.com',
                id: 'customer-email',
                label: 'Email',
                path: 'customer.email',
                type: BeyPropertyVariableType.String
            })
        ],
        id: 'customer',
        label: 'Customer',
        path: 'customer',
        type: BeyPropertyVariableType.Object
    }),
    new BeyPropertyVariable({
        children: [
            new BeyPropertyVariable({
                example: 'INV-001',
                id: 'invoice-number',
                label: 'Number',
                path: 'invoice.number',
                type: BeyPropertyVariableType.String
            }),
            new BeyPropertyVariable({
                example: '2026-07-24',
                id: 'invoice-date',
                label: 'Date',
                path: 'invoice.date',
                type: BeyPropertyVariableType.Date
            })
        ],
        id: 'invoice',
        label: 'Invoice',
        path: 'invoice',
        type: BeyPropertyVariableType.Object
    })
];
