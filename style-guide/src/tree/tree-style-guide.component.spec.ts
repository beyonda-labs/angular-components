import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, settle } from '@testing/dom';

import { TreeStyleGuideComponent } from './tree-style-guide.component';

describe('TreeStyleGuideComponent', () => {
    let fixture: ComponentFixture<TreeStyleGuideComponent>;

    function treeItem(key: string): HTMLElement {
        const label = `angular-components-style-guide.tree.nodes.${key}.label`;
        const found = queryAll(fixture, '[role="treeitem"]').find(item => item.textContent?.trim() === label);

        if (!found) {
            throw new Error(`No tree item ${key}`);
        }

        return found;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TreeStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(TreeStyleGuideComponent);
    });

    it('moves the selection to the node the user clicks and names it below the tree', async () => {
        expect(treeItem('frontend').getAttribute('aria-selected')).toBe('true');

        treeItem('backend').click();
        await settle(fixture);

        expect(treeItem('backend').getAttribute('aria-selected')).toBe('true');
        expect(treeItem('frontend').getAttribute('aria-selected')).toBe('false');
        expect(fixture.nativeElement.textContent).toContain('angular-components-style-guide.tree.selected backend');
    });
});
