import { IAssistantMeta } from '@evo/types';
import { useState, useLayoutEffect } from 'react';
import { getAssistantsData } from '../../glob-state/assistant';

export const useAssistantData = () => {
  const [assistants, setAssistants] = useState<IAssistantMeta[]>([]);
  useLayoutEffect(() => {
    let cleanUpHandler: undefined | (() => any) = undefined;
    let unmounted = false;

    getAssistantsData().then((assistantsData) => {
      if (unmounted) return;

      const subscription = assistantsData.globListen(
        (signal) => {
          const list = assistantsData.getCellsValue({ all: true, getArray: true })
            .array as IAssistantMeta[];

          const sortList = list.sort((a, b) => {
            const timeA = new Date(a.createTime || 0).getTime();
            const timeB = new Date(b.createTime || 0).getTime();
            return timeB - timeA; // 倒序排序
          });

          setAssistants(sortList);
        },
        { immediate: true, debounceTime: 100 }
      );

      cleanUpHandler = () => subscription.unsubscribe();
    });

    return () => {
      unmounted = true;
      cleanUpHandler && cleanUpHandler();
    };
  }, [getAssistantsData]);

  return {
    assistants,
  };
};
