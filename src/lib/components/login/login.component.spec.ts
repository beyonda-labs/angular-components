import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { LoginConfig, LoginConfigParameters } from './models/login.model';
import { LoginHttpService } from './services/login-http.service';

const createConfig = (overrides: Partial<LoginConfigParameters> = {}) =>
    new LoginConfig({
        iconSrc: '',
        productName: 'Test Product',
        productDescription: 'Test description',
        ...overrides
    });

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        const loginHttpSpy = {
            getProviders: jest.fn().mockReturnValue(of([])),
            getRegisterFields: jest.fn().mockReturnValue(of([]))
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, TranslateModule.forRoot()],
            providers: [
                provideRouter([]),
                { provide: LoginHttpService, useValue: loginHttpSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        component.config = createConfig();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should expose the translate prefix from config', () => {
        expect(component.prefix).toBe('angular-components.login');
    });
});
