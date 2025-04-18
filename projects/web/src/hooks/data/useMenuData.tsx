import { BookOutlined, FileOutlined, FileTwoTone, MessageOutlined } from '@ant-design/icons';
import { EvoIcon } from '@evo/component';
import React from 'react';

export interface IMenuDataItem {
  id: number | string;
  name: string;
  icon: string;
  activeIcon?: React.ReactNode;
  path: string;
}

const iconStyle = {
  fontSize: 16,
};

const MENU_DATA: IMenuDataItem[] = [
  {
    id: 1,
    name: '消息',
    icon: 'icon-message',
    path: '/home',
  },
  // {
  //   id: 2,
  //   name: '知识库',
  //   icon: "icon-knowledge",
  //   path: '/knowledge',
  // },
  {
    id: 3,
    name: '助手',
    icon: 'icon-assistant',
    path: '/assistant',
  },
  {
    id: 4,
    name: '知识库',
    icon: 'icon-knowledge',
    path: '/file',
  },
  {
    id: 5,
    name: 'MCP',
    icon: 'icon-config',
    path: '/mcp',
  },
];

export const useMenuData = () => {
  return MENU_DATA;
};
