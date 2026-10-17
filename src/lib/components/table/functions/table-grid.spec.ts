import { TableColumn } from '../models/table.model';
import { toGridTrack } from './table-grid';

describe('toGridTrack', () => {
    it('makes a numeric width a share of the free space, never below one', () => {
        expect(toGridTrack(new TableColumn({ key: 'name', width: 3 }))).toBe('minmax(0, 3fr)');
        expect(toGridTrack(new TableColumn({ key: 'name', width: 0 }))).toBe('minmax(0, 1fr)');
        expect(toGridTrack(new TableColumn({ key: 'name' }))).toBe('minmax(0, 10fr)');
    });

    it('keeps a width written in CSS as it is', () => {
        expect(toGridTrack(new TableColumn({ key: 'name', width: '12rem' }))).toBe('12rem');
    });
});
