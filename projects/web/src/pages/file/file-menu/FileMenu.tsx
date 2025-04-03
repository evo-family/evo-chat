import { Menu } from 'antd';
import React, { FC, useState } from 'react';
import { FileTextOutlined, PictureOutlined, FolderOutlined } from '@ant-design/icons';
import { EResourceType } from '@evo/types';
import { useFileSelector } from '../file-processor/FileProvider';

export interface IFileMenuProps {
  onMenuClick?: (key: EResourceType) => void;
  selectable?: boolean;
}

export const FileMenu: FC<IFileMenuProps> = ({ onMenuClick, selectable = true }) => {
  const menuSelectKey = useFileSelector(s => s.menuSelectKey);
  const setMenuSelectKey = useFileSelector(s => s.setMenuSelectKey);
  const menuItems = [
    {
      key: EResourceType.All,
      icon: <FolderOutlined />,
      label: '全部文件',
    },
    {
      key: EResourceType.Document,
      icon: <FileTextOutlined />,
      label: '文档',
    },
    {
      key: EResourceType.Image,
      icon: <PictureOutlined />,
      label: '图片',
    },
    {
      key: EResourceType.Other,
      icon: <PictureOutlined />,
      label: '其它',
    },
  ];

  const handleMenuSelect = (key: EResourceType) => {
    setMenuSelectKey(key);
    onMenuClick?.(key);
  };

  return (
    <div>
      <Menu
        selectedKeys={!selectable ? [] : [menuSelectKey]}
        items={menuItems}
        onClick={({ key }) => handleMenuSelect(key as EResourceType)}
      />
    </div>
  );
};

