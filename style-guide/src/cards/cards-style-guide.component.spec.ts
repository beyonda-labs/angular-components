import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { CardsStyleGuideComponent } from './cards-style-guide.component';

const PREFIX = 'angular-components-style-guide.cards';

describe('CardsStyleGuideComponent', () => {
    let fixture: ComponentFixture<CardsStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardsStyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(CardsStyleGuideComponent);
    });

    it('unfolds the people of a team in place', async () => {
        const [toggle] = queryAll<HTMLButtonElement>(fixture, 'button[aria-expanded]');

        toggle.click();
        await settle(fixture);

        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.teams.hide`);
    });

    it('confirms what opening a role card would do', () => {
        const role = queryAll<HTMLButtonElement>(fixture, 'button').find(
            button => accessibleName(button) === 'Editors'
        );

        role?.click();

        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.roles.toast` }]);
    });
});
