import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { hostOf, renderComponent } from '@testing/dom';

import { NoticeVariant } from '../../../../notice/models/notice.model';
import { FormNoticeField } from '../../../models/fields/form-notice-field.model';
import { FormNoticeFieldComponent } from './field-notice.component';

describe('FormNoticeFieldComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormNoticeFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translateService = TestBed.inject(TranslateService);

        translateService.setTranslation('en', { demo: { warning: '{{count}} rows are used by others.' } });
        translateService.use('en');
    });

    it('shows its message with its parameters in a notice of its variant', async () => {
        const fixture = await renderComponent(FormNoticeFieldComponent, {
            field: new FormNoticeField({
                key: 'warning',
                message: 'demo.warning',
                messageParameters: { count: 2 },
                variant: NoticeVariant.Danger
            })
        });

        expect(hostOf(fixture).querySelector('[role="alert"]')?.textContent?.trim()).toBe('2 rows are used by others.');
    });
});
