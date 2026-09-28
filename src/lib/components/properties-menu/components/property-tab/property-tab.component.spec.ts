import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton } from '@testing/dom';

import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyGroup } from '../../models/property-group.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTabComponent } from './property-tab.component';

describe('PropertyTabComponent', () => {
    let fixture: ComponentFixture<PropertyTabComponent>;
    let service: PropertiesMenuService;

    const button = (text: string): HTMLButtonElement | null => queryButton(fixture, text);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTabComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTabComponent);
        service = TestBed.inject(PropertiesMenuService);
    });

    it('renders the visible groups only', () => {
        fixture.componentRef.setInput(
            'tab',
            new PropertyTab({
                id: 'properties',
                groups: [
                    new PropertyGroup({ id: 'content', label: 'Contenido' }),
                    new PropertyGroup({ hidden: true, id: 'hidden', label: 'Oculto' })
                ]
            })
        );
        fixture.detectChanges();

        expect(button('Contenido')).not.toBeNull();
        expect(button('Oculto')).toBeNull();
    });

    it('renders no add-group button without an addLabel', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', groups: [] }));
        fixture.detectChanges();

        expect(button('add.label')).toBeNull();
    });

    it('renders the add-group button when addLabel is set', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] }));
        fixture.detectChanges();

        expect(button('add.label')).toBeTruthy();
    });

    it('calls onTabAdd with the tab when the add-group button is clicked', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] }));
        const onTabAdd = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ onTabAdd, prefix: 'app' }));
        fixture.detectChanges();

        button('add.label')?.click();

        expect(onTabAdd).toHaveBeenCalledWith({ tabId: 'properties' });
    });
});
