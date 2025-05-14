import { DataCell, GetDataCellListenOptions, GetDataCellValue } from '../../data-cell/cell';
import { useLayoutEffect, useRef } from 'react';

import { useGetState } from 'ahooks';

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
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const [value, setValue, getValue] = useGetState(() =>
    cellIns ? selector(cellIns.get()) : undefined
  );

  useLayoutEffect(() => {
    if (!cellIns) return;

    const subscribe = cellIns.listen(
      (signal) => {
        const selectedValue = selectorRef.current(signal.next);

        if (getValue() !== selectedValue) {
          setValue(selectedValue);
        }
      },
      {
        receiveDestroySignal: false,
        immediate: true,
        ...options,
      }
    );

    return () => subscribe.unsubscribe();
  }, [cellIns]);

  return [value];
};
