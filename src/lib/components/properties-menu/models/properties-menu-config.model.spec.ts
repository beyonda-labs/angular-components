import { PropertiesMenuConfig } from './properties-menu-config.model';
import { PropertyTab } from './property-tab.model';

describe('PropertiesMenuConfig', () => {
    it('should apply default values when no optional config is provided', () => {
        const config = new PropertiesMenuConfig({ prefix: 'app.properties-menu' });

        expect(config.title).toBe('title');
        expect(config.subtitle).toBe('');
        expect(config.tabs).toEqual([]);
        expect(config.activeTabId).toBe('');
        expect(config.embedded).toBe(false);
    });

    it('should default activeTabId to the first non-hidden tab', () => {
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

    it('should keep an explicit activeTabId', () => {
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
