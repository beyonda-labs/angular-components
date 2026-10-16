import { notificationBadge } from './notification-badge';

describe('notificationBadge', () => {
    it('shows nothing while nothing is unread', () => {
        expect([notificationBadge(0), notificationBadge(-1)]).toEqual(['', '']);
    });

    it('shows the count up to 99 and 99+ above it', () => {
        expect([notificationBadge(1), notificationBadge(99), notificationBadge(100)]).toEqual(['1', '99', '99+']);
    });
});
