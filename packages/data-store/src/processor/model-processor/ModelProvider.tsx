import React, { createContext, FC, useEffect, useState } from 'react';
import { useCreation } from 'ahooks';
import { modelProcessor, ModelProcessor } from './ModelProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IWorkflowProps {
  children: React.ReactElement;
}

const Context = createContext({} as ModelProcessor);

export const ModelProvider: FC<IWorkflowProps> = ({ children }) => {
  // const processorAction = useCreation(() => {
  //   return modelProcessor;
  // }, []);
  // const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      // destroy?.();
    };
  }, []);

  return <Context.Provider value={modelProcessor!}>{children}</Context.Provider>;
};

export function useModelSelector<R extends any>(selector: (s: ModelProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
