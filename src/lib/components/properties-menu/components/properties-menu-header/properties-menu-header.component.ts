import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-properties-menu-header',
    standalone: true,
    styleUrls: ['./properties-menu-header.component.css'],
    templateUrl: './properties-menu-header.component.html'
})
export class PropertiesMenuHeaderComponent {
    @Input() closable = true;
    @Input() icon?: IconDefinition;
    @Input() subtitle = '';
    @Input() title = '';

    @Output() closed = new EventEmitter<void>();

    readonly closeIcon = faXmark;
}
