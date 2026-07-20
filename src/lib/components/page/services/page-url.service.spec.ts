import { TestBed } from '@angular/core/testing';

import { ENVIRONMENT_CONFIG, EnvironmentConfig } from '../../../services/environment/models/environment.model';
import { PageUrlService } from './page-url.service';

function configure(environmentConfig: EnvironmentConfig): PageUrlService {
    TestBed.configureTestingModule({
        providers: [PageUrlService, { provide: ENVIRONMENT_CONFIG, useValue: environmentConfig }]
    });

    return TestBed.inject(PageUrlService);
}

describe('PageUrlService', () => {
    it('should resolve a relative path against baseUrl and webApiPath', () => {
        const service = configure({
            accessControlUrl: 'http://localhost:3000/auth',
            appName: 'Test',
            baseUrl: 'http://localhost:3000',
            cookieName: 'session',
            webApiPath: ''
        });

        expect(service.resolve('/products')).toBe('http://localhost:3000/products');
    });

    it('should include webApiPath when present', () => {
        const service = configure({
            accessControlUrl: 'http://localhost:3000/api/auth',
            appName: 'Test',
            baseUrl: 'http://localhost:3000',
            cookieName: 'session',
            webApiPath: '/api'
        });

        expect(service.resolve('/products')).toBe('http://localhost:3000/api/products');
    });
});
