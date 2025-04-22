import { DataCell } from '../../data-cell/cell';
import { DataCellSignal } from '../../data-cell/types';

export interface DataCellWithStorageDriver {
  has: (cacheKey: string) => Promise<boolean>;
  init: (cacheKey: string, cellIns: DataCell) => any;
  get: <T = any>(cacheKey: string) => Promise<T>;
  update: (cacheKey: string, cellIns: DataCell, notice: DataCellSignal) => any;
  destroy: (cacheKey: string, cellIns?: DataCell) => any;
  bulkGet: <T = any>(cacheKeys: string[]) => Promise<Array<T | undefined>>;
}
