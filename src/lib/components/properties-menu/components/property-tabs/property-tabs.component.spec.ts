import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TabsVariant } from '../../../tabs/models/tabs.model';
import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyTabsComponent } from './property-tabs.component';

describe('PropertyTabsComponent', () => {
    let component: PropertyTabsComponent;
    let fixture: ComponentFixture<PropertyTabsComponent>;
    let service: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTabsComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyTabsComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PropertiesMenuService);
        service.setConfig(
            new PropertiesMenuConfig({
                prefix: 'test.properties-menu',
                tabs: [new PropertyTab({ id: 'structure' }), new PropertyTab({ id: 'add-block' })]
            })
        );
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render as the underline variant, not segmented', () => {
        expect(component.tabsConfig().variant).toBe(TabsVariant.Underline);

        const segmented = fixture.nativeElement.querySelector('.bey-tabs--segmented');
        expect(segmented).toBeNull();
    });
});
