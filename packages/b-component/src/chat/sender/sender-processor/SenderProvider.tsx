import React, { FC, createContext, useEffect } from 'react';
import { useCreation, useUnmount } from 'ahooks';

import { SenderProcessor } from './SenderProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface ISenderProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as SenderProcessor);

export const SenderProvider: FC<ISenderProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return SenderProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useUnmount(() => destroy?.());

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};

export function useSenderSelector<R extends any>(selector: (s: SenderProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
