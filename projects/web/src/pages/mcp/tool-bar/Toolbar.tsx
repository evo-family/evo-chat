import React, { FC } from 'react';
import { useContentPanelSelector } from '../../../components';
import { EnvCheck } from './env-check/EnvCheck';
import { AddMcp } from './add-mcp/AddMcp';
import { Market } from './market/Market';
import { Space } from 'antd';
import { useGlobalCtx } from '@evo/data-store';

export interface IToolbarProps {}

export const Toolbar: FC<IToolbarProps> = (props) => {
  const ToolbarPortal = useContentPanelSelector((s) => s.ToolbarPortal);
  const [isElectron] = useGlobalCtx((s) => s.envProcessor.isElectron);
  return (
    <ToolbarPortal>
      <Space>
        {isElectron && <EnvCheck />}
        <Market />
        <AddMcp />
      </Space>
    </ToolbarPortal>
  );
};
