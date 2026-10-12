import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { AvatarComponent } from '../../../avatar/avatar.component';
import { nextCardIds } from '../../../functions/card-ids';
import { CardListItem } from '../../models/card-list.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AvatarComponent, FontAwesomeModule, NgTemplateOutlet, TranslateModule],
    selector: 'bey-card-list-item',
    standalone: true,
    styleUrls: ['./card-list-item.component.css'],
    templateUrl: './card-list-item.component.html'
})
export class CardListItemComponent {
    readonly item = input.required<CardListItem>();

    readonly chevronIcon = faChevronRight;
    readonly controlsId = computed(() => (this.isOpen() ? this.ids.fold : null));
    readonly describedBy = computed(() => (this.item().subtitle ? this.ids.subtitle : null));
    readonly hasChevron = computed(() => Boolean(this.item().onClick) && !this.item().fold);
    readonly hasFoldItems = computed(() => (this.item().fold?.items.length ?? 0) > 0);
    readonly ids = nextCardIds();
    readonly isOpen = linkedSignal(() => this.item().fold?.isOpen ?? false);
    readonly toggleLabel = computed(() => {
        const { fold } = this.item();

        return (this.isOpen() ? fold?.hideLabel : fold?.showLabel) ?? '';
    });

    open(): void {
        this.item().onClick?.();
    }

    toggle(): void {
        this.isOpen.update(isOpen => !isOpen);
    }
}
