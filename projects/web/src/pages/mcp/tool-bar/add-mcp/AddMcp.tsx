import React, { FC } from 'react';
import { Button, Tooltip, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMcpSelector } from '../../mcp-processor/McpProvider';
import { useGlobalCtx } from '@evo/data-store';
import { AddOrUpdateMcp } from '../../components/add-or-update/AddOrUpdateMcp';

export const AddMcp: FC = () => {
  const setCreateModalData = useMcpSelector((s) => s.addOrUpdateMcpDialog.setCreateModalData);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const [isElectron] = useGlobalCtx((s) => s.envProcessor?.isElectron);

  const handleAddMcp = () => {
    if (!selectCategory) {
      message.info('请先选择分类');
      return;
    }
    setCreateModalData();
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
