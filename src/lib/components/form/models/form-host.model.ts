import { InjectionToken } from '@angular/core';

export interface FormHost {
    close(): void;
    requestClose(): void;
}

export const FORM_HOST = new InjectionToken<FormHost>('FORM_HOST');
