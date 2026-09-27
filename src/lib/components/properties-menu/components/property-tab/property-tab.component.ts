import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyTab } from '../../models/property-tab.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyGroupComponent } from '../property-group/property-group.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, PropertyGroupComponent, TranslateModule],
    selector: 'bey-property-tab',
    standalone: true,
    styleUrls: ['./property-tab.component.css'],
    templateUrl: './property-tab.component.html'
})
export class PropertyTabComponent {
    readonly tab = input.required<PropertyTab>();

    readonly addIcon = faPlus;
    readonly visibleGroups = computed(() => this.tab().groups.filter(group => !group.hidden));

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    onTabAddClick(): void {
        this.propertiesMenuService.triggerTabAdd(this.tab().id);
    }
}
