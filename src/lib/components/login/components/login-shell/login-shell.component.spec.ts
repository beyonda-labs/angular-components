import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { ThemeService } from '../../../../services/theme/theme.service';
import { LoginConfig } from '../../models/login.model';
import { LoginShellComponent } from './login-shell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoginShellComponent],
    standalone: true,
    template: `
        <bey-login-shell title="demo.title" [config]="config">
            <p aside>Aside content</p>
            <p>Card content</p>
        </bey-login-shell>
    `
})
class ShellHostComponent {
    readonly config = new LoginConfig({
        iconSrc: 'logo.svg',
        orgName: 'Beyonda Labs',
        productDescription: 'demo.pitch',
        productName: 'demo.product'
    });
}

describe('LoginShellComponent', () => {
    let fixture: ComponentFixture<ShellHostComponent>;

    function main(): HTMLElement {
        return fixture.nativeElement.querySelector('main');
    }

    beforeEach(async () => {
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [ShellHostComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(ShellHostComponent);
    });

    it('presents the organisation, the product, the title and the content it is given', () => {
        const text = fixture.nativeElement.textContent;

        expect(text).toContain('Beyonda Labs');
        expect(text).toContain('demo.product');
        expect(text).toContain('demo.pitch');
        expect(text).toContain('demo.title');
        expect(text).toContain('Aside content');
        expect(text).toContain('Card content');
    });

    it('swaps the background with the theme', async () => {
        const body = main().parentElement as HTMLElement;

        expect(body.style.backgroundImage).toContain('login-bg-light');

        TestBed.inject(ThemeService).setTheme('dark');
        await settle(fixture);

        expect(body.style.backgroundImage).toContain('login-bg-dark');
    });
});
