import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { FloatingPreferencesComponent } from '../../floating-preferences.component';

@Component({
    imports: [FloatingPreferencesComponent, TranslateModule],
    selector: 'bey-floating-preferences-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './floating-preferences-style-guide.component.html'
})
export class FloatingPreferencesStyleGuideComponent {}
