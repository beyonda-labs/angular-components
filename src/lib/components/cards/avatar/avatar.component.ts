import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { avatarInitials } from './functions/avatar-initials';
import { AvatarConfig } from './models/avatar.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'bey-avatar',
    standalone: true,
    styleUrls: ['./avatar.component.css'],
    templateUrl: './avatar.component.html'
})
export class AvatarComponent {
    readonly config = input.required<AvatarConfig>();

    readonly initials = computed(() => {
        const { initials, name, surname } = this.config();

        return initials || avatarInitials(name, surname);
    });
    readonly variantClass = computed(() => `bey-cards-avatar--${this.config().variant}`);
}
