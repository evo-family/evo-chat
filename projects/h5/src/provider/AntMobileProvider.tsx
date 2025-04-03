import React, { FC, PropsWithChildren, useMemo } from 'react';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import enUS from 'antd-mobile/es/locales/en-US';

export interface IAntMobileProviderProps extends PropsWithChildren { }

export const AntMobileProvider: FC<IAntMobileProviderProps> = ({ children }) => {
  
  const localeC = useMemo(() => {
    // 读取保存的语言 todo_lcf 待调试从 useGlobalContextSelector 中取值
    const savedLanguage = localStorage.getItem('language-preference');
    if (savedLanguage === 'en') {
      return enUS
    }
    return zhCN;
  }, [])
  return (
    <ConfigProvider locale={localeC}>
      {children}
    </ConfigProvider>
  );
};
