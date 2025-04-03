import { DataCell, GetDataCellValue } from '@evo/utils';
import { useMemo, useRef, useState } from 'react';

const useCellValue = <Value extends DataCell>(cellIns: Value): GetDataCellValue<Value> => {
  const [, flushRender] = useState<any>();

  const valueRef = useRef<{ value: any; cleanUp: undefined | (() => void) }>({
    value: undefined,
    cleanUp: undefined,
  });

  // 原来想用useEffect，但是发现他执行时机和预期不符（不像17是立即执行，甚至不执行了干脆。），所以改用useMemo来触发对ref赋值
  useMemo(() => {
    valueRef.current.cleanUp?.();
    valueRef.current.cleanUp = undefined;

    valueRef.current.value = cellIns.get();

    const subscribe = cellIns.listen(
      (signal) => {
        valueRef.current.value = signal.next;
        flushRender(Symbol(''));
      },
      {
        receiveDestroySignal: false,
        checkEqual: (prev, next) => prev === next,
      }
    );

    valueRef.current.cleanUp = () => subscribe.unsubscribe();
  }, [cellIns]);

  return valueRef.current.value;
};
