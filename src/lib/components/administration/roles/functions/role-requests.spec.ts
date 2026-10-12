import { RoleFormValue } from '../models/roles.model';
import { toRoleCreateRequest, toRoleEditRequest } from './role-requests';

describe('role requests', () => {
    const value: RoleFormValue = {
        main: { description: '  Review  ', name: ' Reviewers ', organizationId: 'o2' },
        permissions: { permissions: ['documents.read', 'templates.edit', 'documents.read'] }
    };

    it('creates with the name and the description trimmed, every permission once and the organization', () => {
        expect(toRoleCreateRequest(value)).toEqual({
            description: 'Review',
            name: 'Reviewers',
            organizationId: 'o2',
            permissions: ['documents.read', 'templates.edit']
        });
    });

    it('creates without an organization when the form holds none', () => {
        expect(toRoleCreateRequest({ ...value, main: { name: 'Reviewers' } })).toEqual({
            description: '',
            name: 'Reviewers',
            permissions: ['documents.read', 'templates.edit']
        });
    });

    it('edits without the organization, which a role never changes', () => {
        expect(toRoleEditRequest(value)).toEqual({
            description: 'Review',
            name: 'Reviewers',
            permissions: ['documents.read', 'templates.edit']
        });
    });
});
