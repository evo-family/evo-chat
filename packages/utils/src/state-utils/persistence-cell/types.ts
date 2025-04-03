import { DataCell } from '../../data-cell/cell';
import { DataCellSignal } from '../../data-cell/types';

export interface DataCellWithStorageDriver {
  has: (cacheKey: string) => Promise<boolean>;
  init: (cacheKey: string, cellIns: DataCell) => any;
  update: (cacheKey: string, cellIns: DataCell, notice: DataCellSignal) => any;
  destroy: (cacheKey: string, cellIns?: DataCell) => any;
}
