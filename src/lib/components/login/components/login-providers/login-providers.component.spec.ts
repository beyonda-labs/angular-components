import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent } from '@testing/dom';

import { LoginProviderConfig } from '../../models/login.model';
import { LoginProvidersComponent } from './login-providers.component';

describe('LoginProvidersComponent', () => {
    let fixture: ComponentFixture<LoginProvidersComponent>;

    async function render(providers: LoginProviderConfig[]): Promise<void> {
        fixture = await renderComponent(LoginProvidersComponent, { prefix: 'demo', providers });
    }

    function buttons(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(fixture, 'button');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginProvidersComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('offers one button per provider it knows, under the sign-in-with label', async () => {
        await render([
            { id: 'google', authUrl: 'https://google' },
            { id: 'github' as never, authUrl: 'https://github' },
            { id: 'microsoft', authUrl: 'https://microsoft' }
        ]);

        expect(fixture.nativeElement.textContent).toContain('demo.login.signin-with');
        expect(buttons()).toHaveLength(2);
    });

    it('names each provider button after its provider', async () => {
        await render([
            { id: 'google', authUrl: 'https://google' },
            { id: 'microsoft', authUrl: 'https://microsoft' }
        ]);

        expect(queryButton(fixture, 'angular-components.login.provider.google')).not.toBeNull();
        expect(queryButton(fixture, 'angular-components.login.provider.microsoft')).not.toBeNull();
    });

    it('reports the provider whose button is used', async () => {
        const clicked = jest.fn();
        await render([{ id: 'facebook', authUrl: 'https://facebook' }]);
        fixture.componentInstance.providerClick.subscribe(clicked);

        buttonByName(fixture, 'angular-components.login.provider.facebook').click();

        expect(clicked).toHaveBeenCalledWith({ id: 'facebook', authUrl: 'https://facebook' });
    });

    it('renders nothing without a known provider', async () => {
        await render([]);

        expect(fixture.nativeElement.textContent.trim()).toBe('');
    });
});
