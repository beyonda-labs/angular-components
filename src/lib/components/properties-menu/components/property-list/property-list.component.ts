import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ListComponent } from '../../../list/list.component';
import { ListConfig } from '../../../list/models/list.model';
import { PropertyListItem } from '../../models/property-list-item.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { resolvePropertyLabelKey } from '../../utils/property-i18n.util';

@Component({
    imports: [FontAwesomeModule, ListComponent, TranslateModule],
    selector: 'bey-property-list',
    standalone: true,
    styleUrls: ['./property-list.component.css'],
    templateUrl: './property-list.component.html'
})
export class PropertyListComponent {
    @Input({ required: true }) groupId!: string;
    @Input({ required: true }) items: PropertyListItem[] = [];
    @Input({ required: true }) tabId!: string;

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    get listConfig(): ListConfig {
        return new ListConfig<unknown>({
            getItemKey: item => this.asItem(item).id,
            items: this.items.filter(item => !item.hidden),
            onItemClick: item => this.onItemClick(this.asItem(item)),
            prefix: 'angular-components.properties-menu.list'
        });
    }

    asItem(item: unknown): PropertyListItem {
        return item as PropertyListItem;
    }

    getLabelKey(item: PropertyListItem): string {
        return resolvePropertyLabelKey(this.propertiesMenuService.config().prefix, 'list', item.id, item.label);
    }

    private onItemClick(item: PropertyListItem): void {
        if (item.disabled) {
            return;
        }

        this.propertiesMenuService.selectListItem(this.tabId, this.groupId, item.id);
    }
}
