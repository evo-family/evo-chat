import React, { FC } from 'react';
import { message, Switch, Tooltip } from 'antd';
import { IMcpMeta } from '@evo/types';
import { useRequest } from 'ahooks';
import { useMcpSelector } from '../../mcp-processor/McpProvider';

interface IMcpEnableSwitchProps {
  record: IMcpMeta;
  onUpdateSuccess?: (data?: IMcpMeta) => void;
}

export const McpEnableSwitch: FC<IMcpEnableSwitchProps> = ({ record, onUpdateSuccess }) => {
  const updateMcp = useMcpSelector((s) => s.updateMcp);

  const { loading, run } = useRequest(
    async () => {
      const updateData = { id: record.id, enable: record.enable === 1 ? 0 : 1 };
      const res = await updateMcp(updateData);
      if (res.success) {
        message.success(record.enable === 1 ? '已禁用' : '已启用');
        onUpdateSuccess?.();
      } else {
        message.error(res.error);
      }
      return res;
    },
    { manual: true }
  );

  return (
    <Tooltip title={record?.enable === 1 ? '禁用' : '启用'}>
      <Switch size="small" checked={record?.enable === 1} loading={loading} onChange={run} />
    </Tooltip>
  );
};
