import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeyFormHandle } from '@beyonda-labs/angular-components';
import { buttonByName, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { ModalStyleGuideComponent } from './modal-style-guide.component';

const LONG_FORM = 'angular-components-style-guide.modal.long-form';

describe('ModalStyleGuideComponent', () => {
    let fixture: ComponentFixture<ModalStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModalStyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(ModalStyleGuideComponent);
    });

    it('opens a form longer than the window in a modal, and says so once it is saved', async () => {
        buttonByName(fixture, `${LONG_FORM}.open`).click();
        await settle(fixture);
        const [form] = TestBed.inject(FakeModalFormService).forms();
        const handle = { close: jest.fn() } as unknown as BeyFormHandle;

        form.onSubmit?.({}, handle);
        await settle(fixture);

        expect(form.title).toBe(`${LONG_FORM}.title`);
        expect(form.sections.flatMap(({ rows }) => rows.flatMap(row => row.fields)).length).toBeGreaterThan(10);
        expect(handle.close).toHaveBeenCalled();
        expect(fixture.nativeElement.textContent).toContain(`${LONG_FORM}.sent`);
    });
});
