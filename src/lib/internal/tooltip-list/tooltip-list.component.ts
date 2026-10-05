import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-tooltip-list',
    standalone: true,
    styleUrls: ['./tooltip-list.component.css'],
    templateUrl: './tooltip-list.component.html'
})
export class TooltipListComponent {
    readonly items = input.required<string[]>();
    readonly title = input('');
}
