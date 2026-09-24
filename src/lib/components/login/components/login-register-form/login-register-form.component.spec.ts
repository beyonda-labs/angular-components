import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';

import { LoginConfig, RegisterField } from '../../models/login.model';
import { LoginHttpService } from '../../services/login-http.service';
import { LoginSessionService } from '../../services/login-session.service';
import { LoginRegisterFormComponent } from './login-register-form.component';

const FIELDS: RegisterField[] = [
    { name: 'name', type: 'text', required: true, step: 1 },
    { name: 'email', type: 'email', required: true, step: 2 },
    { name: 'password', type: 'password', required: true, step: 2 }
];

describe('LoginRegisterFormComponent', () => {
    let fixture: ComponentFixture<LoginRegisterFormComponent>;
    let loginHttpService: MockProxy<LoginHttpService>;
    let loginSessionService: MockProxy<LoginSessionService>;

    async function render(fields: RegisterField[] = FIELDS): Promise<void> {
        fixture = TestBed.createComponent(LoginRegisterFormComponent);
        fixture.componentRef.setInput(
            'config',
            new LoginConfig({ iconSrc: '', productDescription: 'Pitch', productName: 'Product' })
        );
        fixture.componentRef.setInput('registerFields', fields);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
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
        await settle();
    }

    async function press(label: string): Promise<void> {
        const found = [...fixture.nativeElement.querySelectorAll<HTMLButtonElement>('button')].find(button =>
            button.textContent?.includes(`register.button.${label}`)
        );

        if (!found) {
            throw new Error(`No ${label} button`);
        }

        found.click();
        await settle();
    }

    beforeEach(async () => {
        loginHttpService = mock<LoginHttpService>();
        loginSessionService = mock<LoginSessionService>();

        await TestBed.configureTestingModule({
            imports: [LoginRegisterFormComponent, TranslateModule.forRoot()],
            providers: [
                { provide: LoginHttpService, useValue: loginHttpService },
                { provide: LoginSessionService, useValue: loginSessionService }
            ]
        }).compileComponents();
    });

    it('walks the steps, gathers every value and registers at the end', async () => {
        const response = { accessToken: 'access', refreshToken: 'refresh' };
        loginHttpService.register.mockReturnValue(of(response));
        await render();

        expect(input('name')).not.toBeNull();
        expect(input('email')).toBeNull();

        await type('name', 'Ada');
        await press('next');

        expect(input('name')).toBeNull();
        await type('email', 'ada@example.com');
        await type('password', 'secret');
        await press('register');

        expect(loginHttpService.register).toHaveBeenCalledWith({
            name: 'Ada',
            email: 'ada@example.com',
            password: 'secret'
        });
        expect(loginSessionService.open).toHaveBeenCalledWith(response);
    });

    it('goes back to the previous step without losing what was typed there', async () => {
        await render();

        await type('name', 'Ada');
        await press('next');
        await press('back');

        expect(input('name')?.value).toBe('Ada');
    });

    it('renders nothing without fields', async () => {
        await render([]);

        expect(fixture.nativeElement.querySelector('input')).toBeNull();
    });
});
