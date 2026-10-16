import { notificationPanelPosition } from './notification-panel-position';

const VIEWPORT = { clientHeight: 800, clientWidth: 1200 };

describe('notificationPanelPosition', () => {
    it('opens downwards beside a bell in the upper half', () => {
        expect(notificationPanelPosition({ bottom: 140, right: 60, top: 100 }, VIEWPORT)).toEqual({
            bottom: null,
            left: 68,
            maxHeight: 692,
            top: 100
        });
    });

    it('opens upwards from a bell in the lower half', () => {
        expect(notificationPanelPosition({ bottom: 760, right: 60, top: 720 }, VIEWPORT)).toEqual({
            bottom: 40,
            left: 68,
            maxHeight: 752,
            top: null
        });
    });

    it('keeps the panel inside the viewport', () => {
        expect(notificationPanelPosition({ bottom: 140, right: 1180, top: 100 }, VIEWPORT).left).toBe(840);
    });
});
