import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BeyFloatingPreferencesComponent } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyFloatingPreferencesComponent, TranslateModule],
    selector: 'bey-floating-preferences-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './floating-preferences-style-guide.component.html'
})
export class FloatingPreferencesStyleGuideComponent {}
