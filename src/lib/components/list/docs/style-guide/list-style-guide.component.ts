import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ListComponent } from '../../list.component';
import { ListConfig } from '../../models/list.model';

interface Employee {
    id: number;
    name: string;
    role: string;
}

@Component({
    imports: [ListComponent, TranslateModule],
    selector: 'bey-list-style-guide',
    standalone: true,
    templateUrl: './list-style-guide.component.html'
})
export class ListStyleGuideComponent {
    readonly config: ListConfig;
    readonly emptyConfig: ListConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.config = new ListConfig<unknown>({
            items: this.buildEmployees(),
            onItemClick: item => this.onEmployeeClick(this.asEmployee(item)),
            prefix: 'angular-components-style-guide.list'
        });

        this.emptyConfig = new ListConfig<unknown>({
            items: [],
            prefix: 'angular-components-style-guide.list'
        });
    }

    asEmployee(item: unknown): Employee {
        return item as Employee;
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    private buildEmployees(): Employee[] {
        return [
            { id: 1, name: 'Ada Lovelace', role: 'Engineering' },
            { id: 2, name: 'Linus Torvalds', role: 'Platform' },
            { id: 3, name: 'Grace Hopper', role: 'Research' }
        ];
    }

    private onEmployeeClick(employee: Employee): void {
        const message = this.translateService.instant('angular-components-style-guide.list.selected');

        // eslint-disable-next-line no-console
        console.log(message, employee);
    }
}
