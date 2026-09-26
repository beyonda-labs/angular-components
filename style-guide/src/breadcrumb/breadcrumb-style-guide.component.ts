import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BeyBreadcrumbComponent, BeyBreadcrumbConfig, BeyBreadcrumbItem } from '@beyonda-labs/angular-components';
import { faBox, faHome, faList, faTag } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyBreadcrumbComponent, TranslateModule],
    selector: 'bey-breadcrumb-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './breadcrumb-style-guide.component.css'],
    templateUrl: './breadcrumb-style-guide.component.html'
})
export class BreadcrumbStyleGuideComponent {
    readonly basicLastClicked = signal('');
    readonly iconsLastClicked = signal('');
    readonly overflowLastClicked = signal('');

    basicConfig: BeyBreadcrumbConfig;
    iconsConfig: BeyBreadcrumbConfig;
    overflowConfig: BeyBreadcrumbConfig;

    constructor() {
        this.basicConfig = new BeyBreadcrumbConfig({
            onItemClick: id => this.basicLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.basic',
            items: [
                new BeyBreadcrumbItem({ id: 1, label: 'home.label' }),
                new BeyBreadcrumbItem({ id: 2, label: 'products.label' }),
                new BeyBreadcrumbItem({ id: 3, label: 'detail.label' })
            ]
        });

        this.iconsConfig = new BeyBreadcrumbConfig({
            onItemClick: id => this.iconsLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.icons',
            items: [
                new BeyBreadcrumbItem({ id: 1, label: 'home.label', icon: faHome }),
                new BeyBreadcrumbItem({ id: 2, label: 'catalog.label', icon: faList }),
                new BeyBreadcrumbItem({ id: 3, label: 'category.label', icon: faTag }),
                new BeyBreadcrumbItem({ id: 4, label: 'product.label', icon: faBox })
            ]
        });

        this.overflowConfig = new BeyBreadcrumbConfig({
            onItemClick: id => this.overflowLastClicked.set(String(id)),
            prefix: 'angular-components-style-guide.breadcrumb.overflow',
            items: [
                new BeyBreadcrumbItem({ id: 1, label: 'home.label' }),
                new BeyBreadcrumbItem({ id: 2, label: 'region.label' }),
                new BeyBreadcrumbItem({ id: 3, label: 'country.label' }),
                new BeyBreadcrumbItem({ id: 4, label: 'state.label' }),
                new BeyBreadcrumbItem({ id: 5, label: 'city.label' }),
                new BeyBreadcrumbItem({ id: 6, label: 'neighborhood.label' }),
                new BeyBreadcrumbItem({ id: 7, label: 'street.label' }),
                new BeyBreadcrumbItem({ id: 8, label: 'building.label' })
            ]
        });
    }
}
