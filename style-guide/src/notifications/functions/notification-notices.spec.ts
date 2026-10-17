import { BeyNotificationType } from '@beyonda-labs/angular-components';

import { STYLE_GUIDE_REVIEW_REQUESTED } from '../models/notifications-style-guide.model';
import { buildNotices } from './notification-notices';

describe('buildNotices', () => {
    it('lists the sample notices newest first, each with an id of its own, all in the past', () => {
        const before = Date.now();
        const notices = buildNotices();
        const times = notices.map(notice => notice.createdAt);

        expect(times).toEqual([...times].sort((first, second) => second - first));
        expect(new Set(notices.map(notice => notice.id)).size).toBe(notices.length);
        expect(times.every(time => time < before)).toBe(true);
    });

    it('covers every type of the library, an app type and one nobody labels', () => {
        const types = new Set(buildNotices().map(notice => notice.type));

        expect(
            [...Object.values(BeyNotificationType), STYLE_GUIDE_REVIEW_REQUESTED].filter(type => !types.has(type))
        ).toEqual([]);
        expect(types.has('billing.invoice-paid')).toBe(true);
    });
});
