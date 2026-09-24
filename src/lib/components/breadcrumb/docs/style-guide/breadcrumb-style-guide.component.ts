import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { faBox, faHome, faList, faTag } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbComponent } from '../../breadcrumb.component';
import { BreadcrumbConfig, BreadcrumbItem } from '../../models/breadcrumb.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BreadcrumbComponent, TranslateModule],
    selector: 'bey-breadcrumb-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './breadcrumb-style-guide.component.css'],
    templateUrl: './breadcrumb-style-guide.component.html'
})
export class BreadcrumbStyleGuideComponent {
    readonly basicLastClicked = signal('');
    readonly iconsLastClicked = signal('');
    readonly overflowLastClicked = signal('');

    basicConfig: BreadcrumbConfig;
    iconsConfig: BreadcrumbConfig;
    overflowConfig: BreadcrumbConfig;

    constructor() {
        this.basicConfig = new BreadcrumbConfig({
            onItemClick: id => this.basicLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.basic',
            items: [
                new BreadcrumbItem({ id: 1, label: 'home.label' }),
                new BreadcrumbItem({ id: 2, label: 'products.label' }),
                new BreadcrumbItem({ id: 3, label: 'detail.label' })
            ]
        });

        this.iconsConfig = new BreadcrumbConfig({
            onItemClick: id => this.iconsLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.icons',
            items: [
                new BreadcrumbItem({ id: 1, label: 'home.label', icon: faHome }),
                new BreadcrumbItem({ id: 2, label: 'catalog.label', icon: faList }),
                new BreadcrumbItem({ id: 3, label: 'category.label', icon: faTag }),
                new BreadcrumbItem({ id: 4, label: 'product.label', icon: faBox })
            ]
        });

        this.overflowConfig = new BreadcrumbConfig({
            onItemClick: id => this.overflowLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.overflow',
            items: [
                new BreadcrumbItem({ id: 1, label: 'home.label' }),
                new BreadcrumbItem({ id: 2, label: 'region.label' }),
                new BreadcrumbItem({ id: 3, label: 'country.label' }),
                new BreadcrumbItem({ id: 4, label: 'state.label' }),
                new BreadcrumbItem({ id: 5, label: 'city.label' }),
                new BreadcrumbItem({ id: 6, label: 'neighborhood.label' }),
                new BreadcrumbItem({ id: 7, label: 'street.label' }),
                new BreadcrumbItem({ id: 8, label: 'building.label' })
            ]
        });
    }
}
