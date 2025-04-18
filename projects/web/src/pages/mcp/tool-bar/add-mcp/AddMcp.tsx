import React, { FC } from 'react';
import { Button, Tooltip, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMcpSelector } from '../../mcp-processor/McpProvider';
import { useGlobalCtx } from '@evo/data-store';
import { AddOrUpdateMcp } from '../../components/add-or-update/AddOrUpdateMcp';

export const AddMcp: FC = () => {
  const openDialog = useMcpSelector((s) => s.addOrUpdateMcpDialog.openDialog);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const [isElectron] = useGlobalCtx((s) => s.envProcessor?.isElectron);

  const handleAddMcp = () => {
    if (!isElectron) {
      message.info('MCP 功能仅支持在桌面端使用');
      return;
    }
    if (!selectCategory) {
      message.info('请先选择分类');
      return;
    }
    openDialog();
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMcp}>
        添加MCP
      </Button>
      <AddOrUpdateMcp />
    </>
  );
};
