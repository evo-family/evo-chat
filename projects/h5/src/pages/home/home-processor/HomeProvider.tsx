import React, { createContext, FC, useEffect, useState } from 'react';
import { useCreation } from 'ahooks';
import { HomeProcessor } from './HomeProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IWorkflowProps {
  children: React.ReactElement;
}

const Context = createContext({} as HomeProcessor);

export const HomeProvider: FC<IWorkflowProps> = React.memo(({ children }) => {
  const [initReady, setInitReady] = useState(false);

  const processorAction = useCreation(() => {
    return HomeProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    processor.initTask.promise.then(() => setInitReady(true));

    return () => {
      destroy?.();
    };
  }, []);

  if (!initReady) return null;

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
});

export function useHomeSelector<R>(selector: (s: HomeProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
