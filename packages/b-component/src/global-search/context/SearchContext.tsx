import React, { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { DataCell } from '@evo/utils';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@evo/data-store';
import { useDeepCompareLayoutEffect } from 'ahooks';

export interface IGlobalSearchContext {
  keywords: DataCell<string[]>;
}

const defaultContext: IGlobalSearchContext = {} as any;

const GlobalSearchContext = createContext(defaultContext);

export const {
  useUnwrapCellSelector: useGlobSearchCtx,
  useProvideContextSelector: useGlobSearchOrgCtx,
} = createUseContextSelector(GlobalSearchContext);

export const GlobalSearchContextProvider = React.memo<PropsWithChildren<{ keywords: string[] }>>(
  (props) => {
    const { keywords, children } = props;

    const [keywordsCell] = useState(() => new DataCell(keywords));

    const contextValue: IGlobalSearchContext = useMemo(() => {
      return { keywords: keywordsCell };
    }, [keywordsCell]);

    useDeepCompareLayoutEffect(() => {
      keywordsCell.set(keywords);
    }, [keywords]);

    return (
      <GlobalSearchContext.Provider value={contextValue}>{children}</GlobalSearchContext.Provider>
    );
  }
);
