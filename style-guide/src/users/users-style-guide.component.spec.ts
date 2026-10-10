import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { hostOf, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { UsersStyleGuideComponent } from './users-style-guide.component';

describe('UsersStyleGuideComponent', () => {
    it('lists the users of the demo backend, with the roles labelled by the demo', async () => {
        await TestBed.configureTestingModule({
            imports: [UsersStyleGuideComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: {
                        en: { 'angular-components-style-guide': { users: { roles: { editor: 'Editor' } } } }
                    }
                })
            ]
        }).compileComponents();
        const httpTesting = TestBed.inject(HttpTestingController);

        const fixture = await renderComponent(UsersStyleGuideComponent);
        httpTesting.expectOne('https://api.test/api/style-guide/users/roles').flush({ roles: ['editor'] });
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === 'https://api.test/api/style-guide/users')
            .flush({
                globalActions: [],
                results: [
                    {
                        actions: [],
                        createdAt: 0,
                        email: 'ada@example.test',
                        id: 'u1',
                        name: 'Ada',
                        roles: ['editor'],
                        status: 'active'
                    }
                ]
            });
        await settle(fixture);

        expect(hostOf(fixture).textContent).toContain('ada@example.test');
        expect(hostOf(fixture).textContent).toContain('Editor');
    });
});
