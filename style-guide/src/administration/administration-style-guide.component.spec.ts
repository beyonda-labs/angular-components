import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AdministrationStyleGuideComponent } from './administration-style-guide.component';

const API_URL = 'https://api.test/api/style-guide';

describe('AdministrationStyleGuideComponent', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdministrationStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: {
                        en: {
                            'angular-components-style-guide': {
                                administration: {
                                    audit: 'Audit',
                                    groups: 'Groups',
                                    'organization-summary': 'Organization summary',
                                    organizations: 'Organizations',
                                    roles: 'Roles and permissions',
                                    users: 'Users'
                                }
                            }
                        }
                    }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('renders the pages of the module, the audit log and the summary of the organization, each under its heading', async () => {
        const fixture = await renderComponent(AdministrationStyleGuideComponent);
        httpTesting.expectOne(`${API_URL}/users/roles`).flush({ roles: [] });
        httpTesting.expectOne(`${API_URL}/roles/permissions`).flush({ permissions: [] });
        httpTesting.expectOne(`${API_URL}/organizations/current`).flush({
            administrators: [{ email: 'ada@example.test', id: 'u1', name: 'Ada', surname: 'Lovelace' }],
            counts: { extraRoles: 0, groups: 1, members: 3 },
            createdAt: 0,
            extraRoles: [],
            groups: [{ id: 'g1', memberCount: 0, members: [], name: 'Sales' }],
            id: 'o1',
            name: 'Acme',
            status: 'active',
            ungroupedMembers: []
        });
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === `${API_URL}/users`)
            .flush({
                globalActions: [],
                results: [
                    { actions: [], createdAt: 0, email: 'ada@example.test', id: 'u1', roles: [], status: 'active' }
                ]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/groups`)
            .flush({
                globalActions: [],
                results: [{ actions: ['edit'], createdAt: 0, id: 'g1', memberCount: 3, name: 'Sales' }]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/roles`)
            .flush({
                globalActions: [],
                results: [
                    {
                        actions: ['view', 'duplicate'],
                        id: 'auditor',
                        isBase: true,
                        memberCount: 1,
                        name: 'auditor',
                        permissions: []
                    }
                ]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/organizations`)
            .flush({
                globalActions: [],
                results: [{ actions: [], createdAt: 0, id: 'o1', name: 'Acme', status: 'active', userCount: 3 }]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/audit`)
            .flush({
                globalActions: [],
                results: [
                    {
                        action: 'create',
                        actions: ['view'],
                        entity: 'templates',
                        entityId: 't1',
                        entityName: 'Invoice',
                        id: 'e1',
                        ip: '203.0.113.7',
                        occurredAt: 0,
                        organizationId: 'o1',
                        requestId: 'req-1',
                        userEmail: 'grace@example.test',
                        userId: 'u2',
                        userName: 'Grace Hopper'
                    }
                ]
            });
        await settle(fixture);

        const text = hostOf(fixture).textContent;

        expect(text).toContain('Users');
        expect(text).toContain('ada@example.test');
        expect(text).toContain('Groups');
        expect(text).toContain('Sales');
        expect(text).toContain('Roles and permissions');
        expect(text).toContain('auditor');
        expect(text).toContain('Organizations');
        expect(text).toContain('Acme');
        expect(text).toContain('Audit');
        expect(text).toContain('Invoice');
        expect(text).toContain('Organization summary');
        expect(text).toContain('Ada Lovelace');
    });
});
