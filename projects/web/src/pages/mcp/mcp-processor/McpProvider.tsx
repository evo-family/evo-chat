import React, { createContext, FC, useEffect } from 'react';
import { useCreation } from 'ahooks';
import { McpProcessor } from './McpProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IMcpProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as McpProcessor);

export const McpProvider: FC<IMcpProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return McpProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      destroy?.();
    };
  }, []);

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};

export function useMcpSelector<R>(selector: (s: McpProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
