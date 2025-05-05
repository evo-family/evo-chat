import React, { FC } from 'react';
import { useContentPanelSelector } from '../../../components';
import { EnvCheck } from './env-check/EnvCheck';
import { AddMcp } from './add-mcp/AddMcp';
import { Market } from './market/Market';
import { Space } from 'antd';

export interface IToolbarProps {}

export const Toolbar: FC<IToolbarProps> = (props) => {
  const ToolbarPortal = useContentPanelSelector((s) => s.ToolbarPortal);

  return (
    <ToolbarPortal>
      <Space>
        <EnvCheck />
        <Market />
        <AddMcp />
      </Space>
    </ToolbarPortal>
  );
};
