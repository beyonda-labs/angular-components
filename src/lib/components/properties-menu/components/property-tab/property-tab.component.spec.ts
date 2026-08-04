import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyGroup } from '../../models/property-group.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTabComponent } from './property-tab.component';

describe('PropertyTabComponent', () => {
    let component: PropertyTabComponent;
    let fixture: ComponentFixture<PropertyTabComponent>;
    let service: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTabComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTabComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PropertiesMenuService);
    });

    it('should render a group per visible group', () => {
        component.tab = new PropertyTab({
            id: 'properties',
            groups: [new PropertyGroup({ id: 'content' }), new PropertyGroup({ id: 'hidden', hidden: true })]
        });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('bey-property-group').length).toBe(1);
    });

    it('should not render the add-group button without an addLabel', () => {
        component.tab = new PropertyTab({ id: 'properties', groups: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-tab-add-group')).toBeNull();
    });

    it('should render the add-group button when addLabel is set', () => {
        component.tab = new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] });
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.bey-property-tab-add-group')).toBeTruthy();
    });

    it('should trigger the tab-add event when the add-group button is clicked', () => {
        component.tab = new PropertyTab({ id: 'properties', addLabel: 'add.label', groups: [] });
        const onTabAddRequested = jest.fn();
        service.onTabAddRequested = onTabAddRequested;
        fixture.detectChanges();

        const button: HTMLButtonElement = fixture.nativeElement.querySelector('.bey-property-tab-add-group');
        button.click();

        expect(onTabAddRequested).toHaveBeenCalledWith({ tabId: 'properties' });
    });
});
