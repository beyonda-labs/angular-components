import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BeyListComponent, BeyListConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

interface Employee {
    id: number;
    name: string;
    role: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyListComponent, TranslateModule],
    selector: 'bey-list-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './list-style-guide.component.html'
})
export class ListStyleGuideComponent {
    readonly config: BeyListConfig;
    readonly emptyConfig: BeyListConfig;
    readonly selectedEmployee = signal('');

    constructor() {
        this.config = new BeyListConfig<unknown>({
            items: this.buildEmployees(),
            onItemClick: item => this.onEmployeeClick(this.asEmployee(item)),
            prefix: 'angular-components-style-guide.list'
        });

        this.emptyConfig = new BeyListConfig<unknown>({
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
        this.selectedEmployee.set(employee.name);
    }
}
