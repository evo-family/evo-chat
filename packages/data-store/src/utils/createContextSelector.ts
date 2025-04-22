import { Context, useContextSelector } from 'use-context-selector';
import { DataCell, GetDataCellValue } from '@evo/utils';
import { useMemo, useRef, useState } from 'react';

export const createUseContextSelector = <Value>(provideContext: Context<Value>) => {
  const useUnwrapCellSelector = <Selected>(
    selector: (value: Value) => Selected
  ): Selected extends DataCell ? [GetDataCellValue<Selected>, Selected] : [Selected] => {
    const selected = useContextSelector(provideContext, selector);

    const [, flushRender] = useState<any>();

    const valueRef = useRef<{ value: any; cleanUp: undefined | (() => void) }>({
      value: undefined,
      cleanUp: undefined,
    });

    // 原来想用useEffect，但是发现他执行时机和预期不符（不像17是立即执行，甚至不执行了干脆。），所以改用useMemo来触发对ref赋值
    useMemo(() => {
      valueRef.current.cleanUp?.();
      valueRef.current.cleanUp = undefined;

      if (selected instanceof DataCell) {
        valueRef.current.value = selected.get();

        const subscribe = selected.listen(
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
      } else {
        valueRef.current.value = selected;
      }
    }, [selected]);

    return [valueRef.current.value, selected] as any;
  };

  const useProvideContextSelector = <Selected>(selector: (contextValue: Value) => Selected) =>
    useContextSelector(provideContext, selector);

  return {
    useUnwrapCellSelector,
    useProvideContextSelector,
  };
};
