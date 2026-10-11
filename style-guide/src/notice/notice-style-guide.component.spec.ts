import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { NoticeStyleGuideComponent } from './notice-style-guide.component';

const PREFIX = 'angular-components-style-guide.notice';

describe('NoticeStyleGuideComponent', () => {
    let fixture: ComponentFixture<NoticeStyleGuideComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NoticeStyleGuideComponent],
            providers: [provideBeyTesting()]
        });

        fixture = await renderComponent(NoticeStyleGuideComponent);
    });

    it('shows the information and the warning politely, and the danger as an alert', () => {
        expect(textsOf(queryAll(fixture, '[role="alert"]'))).toEqual([`${PREFIX}.messages.danger`]);
        expect(textsOf(queryAll(fixture, '[role="status"]'))).toEqual([
            `${PREFIX}.messages.info`,
            expect.stringContaining(`${PREFIX}.messages.warning`)
        ]);
    });

    it('confirms what each action of the warning would do', () => {
        buttonByName(fixture, `${PREFIX}.actions.reload`).click();
        buttonByName(fixture, `${PREFIX}.actions.dismiss`).click();

        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: `${PREFIX}.toast.reload` },
            { message: `${PREFIX}.toast.dismiss` }
        ]);
    });
});
