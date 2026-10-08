import { Injectable, signal } from '@angular/core';
import { BeyFilePreviewConfig, BeyFilePreviewService } from '@beyonda-labs/angular-components';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Injectable()
export class FakeFilePreviewService implements Pick<BeyFilePreviewService, 'open'> {
    private readonly _previews = signal<BeyFilePreviewConfig[]>([]);

    readonly previews = this._previews.asReadonly();

    open(config: BeyFilePreviewConfig): BsModalRef {
        this._previews.update(previews => [...previews, config]);

        return new BsModalRef();
    }
}
