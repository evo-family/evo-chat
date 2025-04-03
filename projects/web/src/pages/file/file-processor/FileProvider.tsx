import React, { createContext, FC, useEffect, useState } from 'react';
import { useCreation } from 'ahooks';
import { FileProcessor } from './FileProcessor';
import { useProcessorSelector } from '@evo/utils';

export interface IFileProviderProps {
  children: React.ReactElement;
}

const Context = createContext({} as FileProcessor);

export const FileProvider: FC<IFileProviderProps> = ({ children }) => {
  const processorAction = useCreation(() => {
    return FileProcessor.create();
  }, []);
  const { processor, getRoot, destroy } = processorAction || {};

  useEffect(() => {
    return () => {
      destroy?.();
    };
  }, []);

  return <Context.Provider value={processor!}>{children}</Context.Provider>;
};


export function useFileSelector<R>(selector: (s: FileProcessor) => R) {
  return useProcessorSelector(Context, selector)
}
