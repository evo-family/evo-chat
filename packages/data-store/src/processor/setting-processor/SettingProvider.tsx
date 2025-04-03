import React, { FC, createContext, useEffect } from 'react';
import { SettingProcessor } from './SettingProcessor';
import { useCreation } from 'ahooks';
import { useProcessorSelector } from '@evo/utils';

export interface ISettingProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as SettingProcessor);

export const SettingProvider: FC<ISettingProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return SettingProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};
  useEffect(() => {
    return () => {
      destroy?.();
    }
  }, [])

  return (
    <Context.Provider value={processor!}>
      {children}
    </Context.Provider>
  );
}

export function useSettingSelector<R extends any>(selector: (s: SettingProcessor) => R) {
  return useProcessorSelector(Context, selector);
}
