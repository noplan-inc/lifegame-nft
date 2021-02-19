import { restoreCellsFromIpfs } from './helper';

export const loadCellsFromContentUrl = async (url: string): Promise<Cell[]> => {
    const resp = await fetch(url);
    if (!resp.ok) {
        return [];
    }

    const exportedCell = await resp.json();

    if (!exportedCell.size) {
        return [];
    }
    return restoreCellsFromIpfs(exportedCell);
};
