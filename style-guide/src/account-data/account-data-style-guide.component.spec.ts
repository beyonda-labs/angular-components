import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, controlByName, hostOf, queryControl, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { AccountDataStyleGuideComponent } from './account-data-style-guide.component';

const ACCOUNT_URL = 'https://api.test/api/style-guide/account';
const PREFIX = 'angular-components.account-data.profile';
const PROFILE = { email: 'ada@example.test', hasPassword: true, id: 'u1', name: 'Ada', roles: [], surname: 'Lovelace' };

describe('AccountDataStyleGuideComponent', () => {
    let fixture: ComponentFixture<AccountDataStyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AccountDataStyleGuideComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(AccountDataStyleGuideComponent);
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);
        await settle(fixture);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('shows the account the demo backend answers with the default fields', () => {
        expect(hostOf(fixture).textContent).toContain('ada@example.test');
        expect(controlByName(fixture, `${PREFIX}.name.label`).value).toBe('Ada');
        expect(controlByName(fixture, `${PREFIX}.surname.label`).value).toBe('Lovelace');
    });

    it('switches to the custom fields, without the surname', async () => {
        buttonByName(fixture, 'angular-components-style-guide.account-data.examples.custom').click();
        await settle(fixture);
        httpTesting.expectOne(ACCOUNT_URL).flush(PROFILE);
        await settle(fixture);

        expect(controlByName(fixture, `${PREFIX}.name.label`).value).toBe('Ada');
        expect(queryControl(fixture, `${PREFIX}.surname.label`)).toBeNull();
    });
});
