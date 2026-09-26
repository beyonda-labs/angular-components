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

    it('should render a group per visible group', () => {
        fixture.componentRef.setInput(
            'tab',
            new PropertyTab({
                id: 'properties',
                groups: [new PropertyGroup({ id: 'content' }), new PropertyGroup({ id: 'hidden', hidden: true })]
            })
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('bey-property-group').length).toBe(1);
    });

    it('should not render the add-group button without an addLabel', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', groups: [] }));
        fixture.detectChanges();

        expect(button('add.label')).toBeNull();
    });

    it('should render the add-group button when addLabel is set', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] }));
        fixture.detectChanges();

        expect(button('add.label')).toBeTruthy();
    });

    it('should trigger the tab-add event when the add-group button is clicked', () => {
        fixture.componentRef.setInput('tab', new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] }));
        const onTabAdd = jest.fn();
        service.setConfig(new PropertiesMenuConfig({ onTabAdd, prefix: 'app' }));
        fixture.detectChanges();

        button('add.label')?.click();

        expect(onTabAdd).toHaveBeenCalledWith({ tabId: 'properties' });
    });
});
