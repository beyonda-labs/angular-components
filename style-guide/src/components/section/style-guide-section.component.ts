import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-style-guide-section',
    standalone: true,
    styleUrls: ['./style-guide-section.component.css'],
    templateUrl: './style-guide-section.component.html'
})
export class StyleGuideSectionComponent {
    readonly titleKey = input.required<string>();
}
