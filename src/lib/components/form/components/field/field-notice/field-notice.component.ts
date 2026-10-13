import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { NoticeConfig } from '../../../../notice/models/notice.model';
import { NoticeComponent } from '../../../../notice/notice.component';
import { FormNoticeField } from '../../../models/fields/form-notice-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NoticeComponent],
    selector: 'bey-form-notice-field',
    standalone: true,
    styleUrls: ['./field-notice.component.css'],
    templateUrl: './field-notice.component.html'
})
export class FormNoticeFieldComponent {
    readonly field = input.required<FormNoticeField>();

    readonly notice = computed(() => {
        const { message, messageParameters, variant } = this.field();

        return new NoticeConfig({ message, messageParameters, variant });
    });
}
