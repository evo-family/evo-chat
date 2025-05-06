import React, { createContext, FC, useEffect } from 'react';
import { useCreation } from 'ahooks';
import { AssistantProcessor } from './AssistantProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IAssistantProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as AssistantProcessor);

export const AssistantProvider: FC<IAssistantProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return AssistantProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      destroy?.();
    };
  }, []);

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};

export function useAssistantSelector<R>(selector: (s: AssistantProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
