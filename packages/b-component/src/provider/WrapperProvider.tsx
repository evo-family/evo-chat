import { GlobalContextProvider, SettingProvider } from '@evo/data-store';
import React, { FC, memo } from 'react';
import { AntdProvider } from './AntdProvider';
import { useATagHandler } from '../hooks';

export interface IWrapperProviderProps {
  children?: React.ReactNode;
}

/**
 * 包装后的通用Provider
 */
export const WrapperProvider: FC<IWrapperProviderProps> = memo((props) => {
  // 处理a标签点击事件
  useATagHandler();
  return (
    <GlobalContextProvider>
      <SettingProvider>
        <AntdProvider>{props.children}</AntdProvider>
      </SettingProvider>
    </GlobalContextProvider>
  );
});
