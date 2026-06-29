import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThemeService } from '../../services/theme/theme.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, FontAwesomeModule, TranslateModule],
    selector: 'bey-floating-preferences',
    standalone: true,
    styleUrls: ['./floating-preferences.component.css'],
    templateUrl: './floating-preferences.component.html'
})
export class FloatingPreferencesComponent {
    readonly faChevronDown = faChevronDown;

    private readonly translateService = inject(TranslateService);
    private readonly themeService = inject(ThemeService);

    readonly lang$ = merge(
        of(this.translateService.currentLang ?? this.translateService.defaultLang),
        this.translateService.onLangChange.pipe(map(event => event.lang))
    );
    readonly theme$ = this.themeService.theme$;

    onLangChange(value: string): void {
        this.translateService.use(value);
    }

    onThemeChange(value: string): void {
        this.themeService.setTheme(value as 'light' | 'dark');
    }
}
