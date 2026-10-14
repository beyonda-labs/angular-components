import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AdministrationStyleGuideComponent } from './administration-style-guide.component';
import { administrationStyleGuideInterceptor } from './functions/administration-backend';

const API_URL = 'https://api.test/api/style-guide';

describe('AdministrationStyleGuideComponent', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdministrationStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    interceptors: [administrationStyleGuideInterceptor],
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

    it('renders every page of the module under its heading, with the groups, the roles and the organization the demo fakes', async () => {
        const fixture = await renderComponent(AdministrationStyleGuideComponent);
        httpTesting.expectOne(`${API_URL}/users/roles`).flush({ roles: [] });
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
            .expectOne(request => request.url === `${API_URL}/organizations`)
            .flush({
                globalActions: [],
                results: [{ actions: [], createdAt: 0, id: 'o2', name: 'Globex', status: 'active', userCount: 3 }]
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
        expect(text).toContain('Reviewers');
        expect(text).toContain('Organizations');
        expect(text).toContain('Globex');
        expect(text).toContain('Acme');
        expect(text).toContain('Audit');
        expect(text).toContain('Invoice');
        expect(text).toContain('Organization summary');
        expect(text).toContain('Ada Lovelace');
    });
});
