import { PropertiesMenuConfig } from './properties-menu-config.model';
import { PropertyTab } from './property-tab.model';

describe('PropertiesMenuConfig', () => {
    it('applies the defaults when no optional config is given', () => {
        const config = new PropertiesMenuConfig({ prefix: 'app.properties-menu' });

        expect(config.title).toBe('title');
        expect(config.subtitle).toBe('');
        expect(config.tabs).toEqual([]);
        expect(config.activeTabId).toBe('');
        expect(config.embedded).toBe(false);
    });

    it('opens the first visible tab by default', () => {
        const config = new PropertiesMenuConfig({
            prefix: 'app.properties-menu',
            tabs: [
                new PropertyTab({ id: 'hidden', label: 'Hidden', hidden: true }),
                new PropertyTab({ id: 'properties', label: 'Propiedades' }),
                new PropertyTab({ id: 'page', label: 'Página' })
            ]
        });

        expect(config.activeTabId).toBe('properties');
    });

    it('keeps an explicit activeTabId', () => {
        const config = new PropertiesMenuConfig({
            prefix: 'app.properties-menu',
            activeTabId: 'page',
            tabs: [
                new PropertyTab({ id: 'properties', label: 'Propiedades' }),
                new PropertyTab({ id: 'page', label: 'Página' })
            ]
        });

        expect(config.activeTabId).toBe('page');
    });
});
