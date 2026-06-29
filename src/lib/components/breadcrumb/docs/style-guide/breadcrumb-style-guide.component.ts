import { Component, inject } from '@angular/core';
import { faBox, faHome, faList, faTag } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BreadcrumbComponent } from '../../breadcrumb.component';
import { BreadcrumbConfig, BreadcrumbItem } from '../../models/breadcrumb.model';

@Component({
    imports: [BreadcrumbComponent, TranslateModule],
    selector: 'bey-breadcrumb-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './breadcrumb-style-guide.component.css'],
    templateUrl: './breadcrumb-style-guide.component.html'
})
export class BreadcrumbStyleGuideComponent {
    lastClicked1 = '';
    lastClicked2 = '';
    lastClicked3 = '';

    basicConfig: BreadcrumbConfig;
    iconsConfig: BreadcrumbConfig;
    overflowConfig: BreadcrumbConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.basicConfig = new BreadcrumbConfig({
            onItemClick: id => {
                this.lastClicked1 = String(id);
                const message = this.translateService.instant('angular-components-style-guide.breadcrumb.clicked');
                //eslint-disable-next-line no-console
                console.log(message, id);
            },
            prefix: 'angular-components-style-guide.breadcrumb.basic',
            items: [
                new BreadcrumbItem({ id: 1, label: 'home.label' }),
                new BreadcrumbItem({ id: 2, label: 'products.label' }),
                new BreadcrumbItem({ id: 3, label: 'detail.label' })
            ]
        });

        this.iconsConfig = new BreadcrumbConfig({
            onItemClick: id => {
                this.lastClicked2 = String(id);
            },
            prefix: 'angular-components-style-guide.breadcrumb.icons',
            items: [
                new BreadcrumbItem({ id: 1, label: 'home.label', icon: faHome }),
                new BreadcrumbItem({ id: 2, label: 'catalog.label', icon: faList }),
                new BreadcrumbItem({ id: 3, label: 'category.label', icon: faTag }),
                new BreadcrumbItem({ id: 4, label: 'product.label', icon: faBox })
            ]
        });

        this.overflowConfig = new BreadcrumbConfig({
            onItemClick: id => {
                this.lastClicked3 = String(id);
            },
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
