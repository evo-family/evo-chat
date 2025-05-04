import React, { FC } from 'react';
import { App, ConfigProvider, theme } from 'antd';

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
          wireframe: true,
          colorPrimary: '#13C2C2',
          colorInfo: '#13C2C2',
          // colorPrimary: !isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.55)',
          // colorInfo: !isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          colorPrimaryActive: !isDark ? `rgba(0, 0, 0, 0.95)` : `rgba(255, 255, 255, 0.75)`,
        },
        components: {
          Button: {},
          Select: {
            optionSelectedBg: 'var(--evo-color-fill-secondary)',
          },
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
      <App>{props.children}</App>
    </ConfigProvider>
  );
});
