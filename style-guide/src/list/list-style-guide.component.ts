import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BeyAvatarComponent, BeyAvatarConfig, BeyListComponent, BeyListConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

interface Employee {
    avatar: BeyAvatarConfig;
    id: number;
    name: string;
    role: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyAvatarComponent, BeyListComponent, TranslateModule],
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

    private buildEmployees(): Employee[] {
        return [
            buildEmployee(1, ['Ada', 'Lovelace'], 'Engineering'),
            buildEmployee(2, ['Linus', 'Torvalds'], 'Platform'),
            buildEmployee(3, ['Grace', 'Hopper'], 'Research')
        ];
    }

    private onEmployeeClick(employee: Employee): void {
        this.selectedEmployee.set(employee.name);
    }
}

function buildEmployee(id: number, [name, surname]: [string, string], role: string): Employee {
    return { avatar: new BeyAvatarConfig({ name, surname }), id, name: `${name} ${surname}`, role };
}
