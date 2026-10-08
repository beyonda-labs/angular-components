import { FormSection } from '../../form/models/form.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageFormConfig } from '../models/page-form.model';
import { PageItem } from '../models/page-item.model';
import { buildMoveTargetNodes } from './page-move-targets';

interface SelectedRow extends PageItem {
    type: PageItemType;
}

describe('buildMoveTargetNodes', () => {
    const categoriesConfig = new PageCategoriesConfig({
        formConfig: new PageFormConfig({
            buildSections: () => [new FormSection({ key: 'category', rows: [] })],
            prefix: 'testPage.category.form'
        })
    });
    const categories = [
        { id: 'cat-1', name: 'Electronics', parentId: null },
        { id: 'cat-2', name: 'Phones', parentId: 'cat-1' },
        { id: 'cat-3', name: 'Books', parentId: null }
    ] as unknown as PageItem[];

    it('nests every category under a root node named after the categories root', () => {
        const [root] = buildMoveTargetNodes('testPage', categories, categoriesConfig, []);

        expect({ key: root.key, label: root.label, data: root.data }).toEqual({
            key: '__root__',
            label: 'testPage.categories.root',
            data: { id: null }
        });
        expect(root.children.map(node => [node.key, node.label])).toEqual([
            ['cat-1', 'Electronics'],
            ['cat-3', 'Books']
        ]);
        expect(root.children[0].children.map(node => node.data)).toEqual([{ id: 'cat-2' }]);
    });

    it('disables the moved categories and their descendants, and nothing else', () => {
        const selected: SelectedRow[] = [
            { id: 'cat-1', type: PageItemType.Category },
            { id: 'item-1', type: PageItemType.Item }
        ];
        const [root] = buildMoveTargetNodes('testPage', categories, categoriesConfig, selected);
        const [electronics, books] = root.children;

        expect([root, electronics, electronics.children[0], books].map(node => node.isDisabled)).toEqual([
            false,
            true,
            true,
            false
        ]);
    });
});
