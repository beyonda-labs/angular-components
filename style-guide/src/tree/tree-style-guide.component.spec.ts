import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { TreeStyleGuideComponent } from './tree-style-guide.component';

describe('TreeStyleGuideComponent', () => {
    let component: TreeStyleGuideComponent;
    let fixture: ComponentFixture<TreeStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TreeStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(TreeStyleGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update selectedKey when a different node is selected', () => {
        expect(component.config.selectedKey).toBe('frontend');

        const nodes = fixture.nativeElement.querySelectorAll('[role="treeitem"]');

        (nodes[2] as HTMLElement).click();

        expect(component.config.selectedKey).toBe('backend');
    });
});
