import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoginProviderConfig } from '../../models/login.model';
import { LoginProvidersComponent } from './login-providers.component';

describe('LoginProvidersComponent', () => {
    let fixture: ComponentFixture<LoginProvidersComponent>;

    async function render(providers: LoginProviderConfig[]): Promise<void> {
        fixture = TestBed.createComponent(LoginProvidersComponent);
        fixture.componentRef.setInput('prefix', 'demo');
        fixture.componentRef.setInput('providers', providers);
        fixture.detectChanges();
        await fixture.whenStable();
    }

    function buttons(): HTMLButtonElement[] {
        return [...fixture.nativeElement.querySelectorAll('button')];
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

        expect(fixture.nativeElement.textContent).toContain('demo.login.signinWith');
        expect(buttons()).toHaveLength(2);
    });

    it('reports the provider whose button is used', async () => {
        const clicked = jest.fn();
        await render([{ id: 'facebook', authUrl: 'https://facebook' }]);
        fixture.componentInstance.providerClick.subscribe(clicked);

        buttons()[0].click();

        expect(clicked).toHaveBeenCalledWith({ id: 'facebook', authUrl: 'https://facebook' });
    });

    it('renders nothing without a known provider', async () => {
        await render([]);

        expect(fixture.nativeElement.textContent.trim()).toBe('');
    });
});
