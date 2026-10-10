import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleDescription, buttonByName, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { LoginConfig, RegisterField } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginRegisterFormComponent } from './login-register-form.component';

const FIELDS: RegisterField[] = [
    { name: 'name', type: 'text', required: true, step: 1 },
    { name: 'email', type: 'email', required: true, step: 2 },
    { name: 'password', type: 'password', required: true, step: 2 },
    { name: 'password2', type: 'password', required: true, step: 2 }
];
const NEXT = 'angular-components.form.steps.next';
const POLICY_URL = 'https://api.test/auth/password-policy';
const REGISTER = 'angular-components.login.register.button.register';
const STRICT = { isDigitRequired: true, isLowercaseRequired: true, isSymbolRequired: true, isUppercaseRequired: true };
const STRONG = 'Correct-h0rse';

describe('LoginRegisterFormComponent', () => {
    let fixture: ComponentFixture<LoginRegisterFormComponent>;
    let httpTesting: HttpTestingController;
    let loginHttpService: MockProxy<LoginHttpService>;
    let loginSessionService: MockProxy<LoginSessionService>;

    async function render(fields: RegisterField[] = FIELDS): Promise<void> {
        fixture = await renderComponent(LoginRegisterFormComponent, {
            config: new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product' }),
            registerFields: fields
        });
    }

    function input(id: string): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`#${id}`);
    }

    async function type(id: string, value: string): Promise<void> {
        const field = input(id);

        if (!field) {
            throw new Error(`No field ${id}`);
        }

        field.value = value;
        field.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    async function press(label: string): Promise<void> {
        buttonByName(fixture, label).click();
        await settle(fixture);
    }

    async function reachPasswords(): Promise<void> {
        await type('name', 'Ada');
        await press(NEXT);
        httpTesting.expectOne(POLICY_URL).flush(STRICT);
        await settle(fixture);
    }

    async function fillPasswords(password: string): Promise<void> {
        await type('email', 'ada@example.com');
        await type('password', password);
        await type('password2', password);
    }

    beforeEach(async () => {
        loginHttpService = mock<LoginHttpService>();
        loginSessionService = mock<LoginSessionService>();

        await TestBed.configureTestingModule({
            imports: [LoginRegisterFormComponent],
            providers: [
                provideBeyTesting(),
                { provide: LoginHttpService, useValue: loginHttpService },
                { provide: LoginSessionService, useValue: loginSessionService }
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('walks the steps, gathers every value and registers at the end', async () => {
        const response = { accessToken: 'access' };
        loginHttpService.register.mockReturnValue(of(response));
        await render();

        expect(input('name')).not.toBeNull();
        expect(input('email')).toBeNull();
        httpTesting.expectNone(POLICY_URL);

        await reachPasswords();

        expect(input('name')).toBeNull();
        await fillPasswords(STRONG);
        await press(REGISTER);

        expect(loginHttpService.register).toHaveBeenCalledWith({
            name: 'Ada',
            email: 'ada@example.com',
            password: STRONG,
            password2: STRONG
        });
        expect(loginSessionService.open).toHaveBeenCalledWith(response);
    });

    it('reports a registration that waits for a verified email instead of opening a session', async () => {
        const verificationRequired = jest.fn();
        loginHttpService.register.mockReturnValue(of({ verificationRequired: true }));
        await render();
        fixture.componentInstance.verificationRequired.subscribe(verificationRequired);

        await reachPasswords();
        await fillPasswords(STRONG);
        await press(REGISTER);

        expect(verificationRequired).toHaveBeenCalled();
        expect(loginSessionService.open).not.toHaveBeenCalled();
    });

    it('checks the password against the policy the server answers, and never its confirmation', async () => {
        await render();

        await reachPasswords();
        await fillPasswords('correct-horse');

        expect(accessibleDescription(input('password') as HTMLInputElement)).toContain(
            'angular-components.form.password-field.policy.uppercase'
        );
        expect(accessibleDescription(input('password2') as HTMLInputElement)).toBe('');
        expect(buttonByName(fixture, REGISTER).disabled).toBe(true);
    });

    it('goes back to the previous step without losing what was typed there', async () => {
        await render();

        await reachPasswords();
        await press('angular-components.form.steps.back');

        expect(input('name')?.value).toBe('Ada');
    });

    it('renders nothing without fields', async () => {
        await render([]);

        expect(fixture.nativeElement.querySelector('input')).toBeNull();
    });
});
