import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT_CONFIG } from '../../../services/environment/models/environment.model';

@Injectable({
    providedIn: 'root'
})
export class PageUrlService {
    private readonly envConfig = inject(ENVIRONMENT_CONFIG);

    resolve(path: string): string {
        return `${this.envConfig.baseUrl}${this.envConfig.webApiPath}${path}`;
    }
}
