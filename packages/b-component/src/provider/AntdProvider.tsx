import React, { FC } from 'react';
import { ConfigProvider, theme } from 'antd';

import zhCN from 'antd/locale/zh_CN';
import { EThemeMode } from '../../../types/src/setting';
import { useTheme, useAntdToken } from '@evo/component';

export interface IAntdProviderProps {
  children: React.ReactNode;
}

export const AntdProvider: FC<IAntdProviderProps> = React.memo((props) => {
  const token = useAntdToken();

  const currTheme = useTheme();
  if (!currTheme) {
    return <></>;
  }
  const isDark = currTheme === EThemeMode.Dark;
  // theme.compactAlgorithm (紧凑模式)
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? [theme.darkAlgorithm] : [],
        token: {
          // colorPrimary: !isDark ? `rgba(0, 0, 0, 0.88)` : `rgba(255, 255, 255, 0.88)`,
          // colorPrimaryTextActive: token.colorTextSecondary,
          // colorText: 'var(--evo-color-text)', // token.colorText,
          colorPrimaryActive: !isDark ? `rgba(0, 0, 0, 0.88)` : `rgba(255, 255, 255, 0.88)`,
        },
        components: {
          Button: {},
          Menu: {
            colorText: `var(--evo-color-text-secondary)`, // token.colorTextSecondary,
            itemSelectedColor: `var(--evo-color-primary-active)`,
            itemSelectedBg: 'var(--evo-color-fill-secondary)', // token.colorFillSecondary,
          },
        },
        cssVar: {
          prefix: 'evo',
          key: 'body',
        },
        hashed: false,
      }}
    >
      {props.children}
    </ConfigProvider>
  );
});
