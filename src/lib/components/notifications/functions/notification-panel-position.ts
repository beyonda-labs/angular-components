import { NotificationPanelPosition } from '../models/notifications.model';

const PANEL_GAP_PX = 8;
const PANEL_WIDTH_PX = 352;

export function notificationPanelPosition(
    { bottom, right, top }: Pick<DOMRect, 'bottom' | 'right' | 'top'>,
    { clientHeight, clientWidth }: Pick<HTMLElement, 'clientHeight' | 'clientWidth'>
): NotificationPanelPosition {
    const left = Math.max(PANEL_GAP_PX, Math.min(right + PANEL_GAP_PX, clientWidth - PANEL_WIDTH_PX - PANEL_GAP_PX));
    const isBelowMiddle = top > clientHeight / 2;

    return isBelowMiddle
        ? { bottom: clientHeight - bottom, left, maxHeight: bottom - PANEL_GAP_PX, top: null }
        : { bottom: null, left, maxHeight: clientHeight - top - PANEL_GAP_PX, top };
}
