import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    viewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PropertiesMenuHeaderComponent } from './components/properties-menu-header/properties-menu-header.component';
import { PropertyTabComponent } from './components/property-tab/property-tab.component';
import { PropertyTabsComponent } from './components/property-tabs/property-tabs.component';
import { PropertiesMenuConfig } from './models/properties-menu-config.model';
import { PropertiesMenuHeaderConfig } from './models/properties-menu-header.model';
import { PropertyVariable } from './models/property-variable.model';
import { PropertiesMenuService } from './services/properties-menu.service';
import { PropertyTreeDragService } from './services/property-tree-drag.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PropertiesMenuHeaderComponent, PropertyTabComponent, PropertyTabsComponent, TranslateModule],
    providers: [PropertiesMenuService, PropertyTreeDragService],
    selector: 'bey-properties-menu',
    standalone: true,
    styleUrls: ['./properties-menu.component.css'],
    templateUrl: './properties-menu.component.html'
})
export class PropertiesMenuComponent {
    readonly config = input.required<PropertiesMenuConfig>();
    readonly variables = input<PropertyVariable[]>([]);

    readonly activeTab = computed(() => {
        const activeTabId = this.propertiesMenuService.activeTabId();

        return this.propertiesMenuService.config().tabs.find(tab => tab.id === activeTabId);
    });
    readonly headerConfig = computed(
        () =>
            new PropertiesMenuHeaderConfig({
                icon: this.config().icon,
                onClose: this.config().onClose,
                subtitle: this.config().subtitle,
                title: this.titleKey()
            })
    );
    readonly titleKey = computed(() => {
        const { prefix, title } = this.config();

        return title === 'title' ? `${prefix}.title` : title;
    });
    readonly visibleTabs = computed(() => this.config().tabs.filter(tab => !tab.hidden));

    private readonly menuBody = viewChild<ElementRef<HTMLElement>>('menuBody');

    private readonly propertiesMenuService = inject(PropertiesMenuService);

    constructor() {
        effect(() => this.propertiesMenuService.setConfig(this.config()));
        effect(() => this.propertiesMenuService.setVariables(this.variables()));

        effect(() => {
            this.propertiesMenuService.activeTabId();

            const body = this.menuBody();

            if (body) {
                body.nativeElement.scrollTop = 0;
            }
        });
    }
}
