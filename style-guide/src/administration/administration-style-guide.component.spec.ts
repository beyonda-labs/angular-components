import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AdministrationStyleGuideComponent } from './administration-style-guide.component';

const API_URL = 'https://api.test/api/style-guide';

describe('AdministrationStyleGuideComponent', () => {
    it('renders the four pages of the module, each under its heading', async () => {
        await TestBed.configureTestingModule({
            imports: [AdministrationStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: {
                        en: {
                            'angular-components-style-guide': {
                                administration: {
                                    groups: 'Groups',
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
        const httpTesting = TestBed.inject(HttpTestingController);

        const fixture = await renderComponent(AdministrationStyleGuideComponent);
        httpTesting.expectOne(`${API_URL}/users/roles`).flush({ roles: [] });
        httpTesting.expectOne(`${API_URL}/roles/permissions`).flush({ permissions: [] });
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
                results: [{ actions: [], createdAt: 0, id: 'g1', memberCount: 3, name: 'Sales' }]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/roles`)
            .flush({
                globalActions: [],
                results: [
                    { actions: [], id: 'auditor', isBase: true, memberCount: 1, name: 'auditor', permissions: [] }
                ]
            });
        httpTesting
            .expectOne(request => request.url === `${API_URL}/organizations`)
            .flush({
                globalActions: [],
                results: [{ actions: [], createdAt: 0, id: 'o1', name: 'Acme', status: 'active', userCount: 3 }]
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
        httpTesting.verify();
    });
});
