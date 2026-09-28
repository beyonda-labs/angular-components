import { PropertyToggleField } from './fields/property-toggle-field.model';
import { PropertyGroupContentType, PropertyGroupTab, PropertyTabsContent } from './property-group-content.model';

describe('PropertyGroupTab', () => {
    it('defaults the label to a key derived from the id', () => {
        expect(new PropertyGroupTab({ id: 'borderTop' }).label).toBe('borderTop.label');
    });

    it('defaults to an empty field list', () => {
        expect(new PropertyGroupTab({ id: 'borderTop' }).fields).toEqual([]);
    });
});

const buildTabs = (): PropertyGroupTab[] => [
    new PropertyGroupTab({ id: 'top', fields: [new PropertyToggleField({ id: 'topVisible' })] }),
    new PropertyGroupTab({ id: 'right' })
];

describe('PropertyTabsContent', () => {
    it('identifies itself as tabbed content', () => {
        expect(new PropertyTabsContent({}).type).toBe(PropertyGroupContentType.TABS);
    });

    it('opens on the first tab when no active tab is given', () => {
        expect(new PropertyTabsContent({ tabs: buildTabs() }).activeTabId).toBe('top');
    });

    it('keeps an explicit active tab', () => {
        expect(new PropertyTabsContent({ tabs: buildTabs(), activeTabId: 'right' }).activeTabId).toBe('right');
    });

    it('tolerates having no tabs at all', () => {
        expect(new PropertyTabsContent({}).activeTabId).toBe('');
    });
});
