import React, { FC, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { TabBar } from 'antd-mobile';
import {
  MessageOutline,
  FillinOutline,
  FileOutline,
  SetOutline,
} from 'antd-mobile-icons';
import s from './MainLayout.module.scss';
import { useTabBar } from '../../hooks/useTabBar';
import { EvoIcon, useThemeColor } from '@evo/component';

export interface IMainLayoutProps {}

const tabs = [
  {
    key: '/home',
    title: '消息',
    icon: <EvoIcon size={'small'} type="icon-message" />,
  },
  {
    key: '/assistant',
    title: '助手',
    icon: <EvoIcon size={'small'} type="icon-assistant" />,
  },
  // {
  //   key: '/knowledge',
  //   title: '知识库',
  //   icon: <EvoIcon size={'small'} type="icon-knowledge" />,
  // },
  {
    key: '/mcp',
    title: 'MCP',
    icon: <EvoIcon size={'small'} type="icon-file" />,
  },
  {
    key: '/settings',
    title: '设置',
    icon: <EvoIcon size={'small'} type="icon-config" />,
  },
];

export const MainLayout: FC<IMainLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { pathname } = useLocation();
  // const { showTabBar, hideTabBar } = useTabBar();
  const [showTabBar, setShowTabBar] = useState(true);
  const themColor = useThemeColor();
  useEffect(() => {
    const showTabRoutes = [
      '/home',
      '/assistant',
      '/knowledge',
      '/file',
      '/settings',
    ];
    console.debug('todo 待调试 000  ===== showTabBar pathname: ', pathname);
    if (showTabRoutes.includes(pathname)) {
      setShowTabBar(true);
    } else {
      setShowTabBar(false);
    }
  }, [pathname]);

  return (
    <div style={{ backgroundColor: themColor }} className={s.layout}>
      <div className={s.content}>
        <Outlet />
      </div>
      {showTabBar ? (
        <TabBar
          className={s.tabBar}
          activeKey={location.pathname}
          onChange={(value) => navigate(value)}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      ) : null}
    </div>
  );
};
