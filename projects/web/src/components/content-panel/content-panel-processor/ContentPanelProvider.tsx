import React, { createContext, FC, useEffect } from 'react';
import { useCreation } from 'ahooks';
import { ContentPanelProcessor } from './ContentPanelProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IContentPanelProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as ContentPanelProcessor);

export const ContentPanelProvider: FC<IContentPanelProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return ContentPanelProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      destroy?.();
    };
  }, []);

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};

export function useContentPanelSelector<R>(selector: (s: ContentPanelProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
