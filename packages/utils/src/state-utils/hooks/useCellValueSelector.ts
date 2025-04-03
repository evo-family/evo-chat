import { DataCell, GetDataCellListenOptions, GetDataCellValue } from '../../data-cell/cell';
import { useMemo, useRef } from 'react';
import { useUnmount, useUpdate } from 'ahooks';

import { useTransition } from 'react';

export interface IUseCellValueSelector {
  <CellIns extends DataCell, Selected>(
    cellIns: CellIns,
    selector: (value: GetDataCellValue<CellIns>) => Selected,
    options?: GetDataCellListenOptions<CellIns>
  ): [Selected];
  <CellIns extends DataCell, Selected>(
    cellIns: CellIns | undefined,
    selector: (value?: GetDataCellValue<CellIns>) => Selected,
    options?: GetDataCellListenOptions<CellIns>
  ): [Selected | undefined];
}
export const useCellValueSelector: IUseCellValueSelector = <CellIns extends DataCell, Selected>(
  cellIns: CellIns | undefined,
  selector: (value: GetDataCellValue<CellIns>) => Selected,
  options?: GetDataCellListenOptions<CellIns>
) => {
  const flusRender = useUpdate();
  const [isPending, startTransition] = useTransition();

  const valueRef = useRef<{ value: any; cleanUp: undefined | (() => void) }>({
    value: undefined,
    cleanUp: undefined,
  });
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  // 原来想用useEffect，但是发现他执行时机和预期不符（不像17是立即执行，甚至不执行了干脆。），所以改用useMemo来触发对ref赋值
  useMemo(() => {
    valueRef.current.cleanUp?.();
    valueRef.current.cleanUp = undefined;

    if (!cellIns) return;

    valueRef.current.value = selectorRef.current(cellIns?.get());

    const subscribe = cellIns.listen(
      (signal) => {
        const selectedValue = selectorRef.current(signal.next);

        if (valueRef.current.value !== selectedValue) {
          valueRef.current.value = selectedValue;
          startTransition(() => flusRender());
        }
      },
      {
        receiveDestroySignal: false,
        ...options,
      }
    );

    valueRef.current.cleanUp = () => subscribe.unsubscribe();
  }, [cellIns, flusRender, startTransition]);

  useUnmount(() => {
    valueRef.current.cleanUp?.();
    valueRef.current.cleanUp = undefined;
    valueRef.current.value = undefined;
  });

  return [valueRef.current.value] as any;
};
