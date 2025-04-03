import React, { createContext, FC, useEffect, useState } from 'react';
import { useCreation } from 'ahooks';
import { KnowledgeProcessor } from './KnowledgeProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IKnowledgeProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as KnowledgeProcessor);

export const KnowledgeProvider: FC<IKnowledgeProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return KnowledgeProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      destroy?.();
    };
  }, []);

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};


export function useKnowledgeSelector<R>(
  selector: (s: KnowledgeProcessor) => R
) {
  return useProcessorSelector(Context, selector)
}
