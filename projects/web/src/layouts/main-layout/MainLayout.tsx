import { Button, Layout } from 'antd';
import React, { FC } from 'react';

import { LayoutMenu } from './layout-menu/LayoutMenu';
import { Outlet } from 'react-router';
import classNames from 'classnames';
import s from './MainLayout.module.scss';
import { useAntdToken, useThemeColor } from '@evo/component';
import { useSettingSelector } from '@evo/data-store';
import { ELayout } from '@evo/types';

export interface IMainLayoutProps {}

export const MainLayout: FC<IMainLayoutProps> = (props) => {
  const token = useAntdToken();

  const themColor = useThemeColor();
  const layout = useSettingSelector((s) => s.layout);

  // token.colorBgContainer
  return (
    <div style={{ backgroundColor: themColor }} className={classNames(s.layout, 'app-region-drag')}>
      <div className={classNames(s.left, 'app-region-drag')}>
        <LayoutMenu />
      </div>
      <div
        style={{
          backgroundColor: token.colorBgContainer,
          // backgroundColor: layout === ELayout.l2 ? token.colorBgContainer : token.colorBgLayout,
        }}
        className={classNames(s.right, 'app-region-no-drag')}
      >
        <Outlet />
      </div>
    </div>
  );
};
