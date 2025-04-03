import { useUpdate } from 'ahooks';
import { useEffect } from 'react';

import { useTransition } from 'react';
import { DataCell, GetDataCellListenOptions } from '../../data-cell/cell';

// 函数重载声明
export function useCellValue<CellIns extends DataCell>(
  cellIns: NonNullable<CellIns>,
  options?: GetDataCellListenOptions<CellIns>
): [ReturnType<CellIns['get']>];
export function useCellValue<CellIns extends DataCell>(
  cellIns?: CellIns | undefined,
  options?: GetDataCellListenOptions<CellIns>
): [ReturnType<CellIns['get']> | undefined];
// 函数实现
export function useCellValue<CellIns extends DataCell>(
  cellIns?: CellIns,
  options?: GetDataCellListenOptions<CellIns>
) {
  const flusRender = useUpdate();
  const [isPending, startTransition] = useTransition();

  // 原来想用useEffect，但是发现他执行时机和预期不符（不像17是立即执行，甚至不执行了干脆。），所以改用useMemo来触发对ref赋值
  useEffect(() => {
    if (!cellIns) return;

    const subscribe = cellIns.listen(
      () => {
        startTransition(() => flusRender());
      },
      {
        receiveDestroySignal: false,
        ...options,
      }
    );

    return () => {
      subscribe.unsubscribe();
    };
  }, [cellIns, flusRender, startTransition]);

  return [cellIns?.get()];
}
