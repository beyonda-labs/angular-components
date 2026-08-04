import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyGroup } from '../../models/property-group.model';
import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyGroupComponent } from '../property-group/property-group.component';

@Component({
    imports: [FontAwesomeModule, PropertyGroupComponent, TranslateModule],
    selector: 'bey-property-tab',
    standalone: true,
    styleUrls: ['./property-tab.component.css'],
    templateUrl: './property-tab.component.html'
})
export class PropertyTabComponent {
    @Input({ required: true }) tab!: PropertyTab;

    readonly addIcon = faPlus;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get visibleGroups(): PropertyGroup[] {
        return this.tab.groups.filter(group => !group.hidden);
    }

    onTabAddClick(): void {
        this.propertiesMenuService.triggerTabAdd(this.tab.id);
    }
}
