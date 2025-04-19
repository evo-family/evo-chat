import React, { FC, useEffect, useState } from 'react';
import { ProList } from '@ant-design/pro-components';
import { Button, Divider, Empty, message, Modal, Space, Switch, Tag } from 'antd';

import { useMcpSelector } from '../mcp-processor/McpProvider';
import { EMcpType } from '@evo/types';
import s from './McpList.module.scss';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { Tooltip } from 'antd'; // 确保导入 Tooltip
import { McpEnableSwitch } from '../components/mcp-enable-switch/McpEnableSwitch';
import { McpTools } from '../components/mcp-tools/McpTools';

export const McpList: FC = () => {
  const mcpList = useMcpSelector((s) => s.mcpListResult || []);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const getMcpListByCategoryId = useMcpSelector((s) => s.getMcpListByCategoryId);
  const setDialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.setDialogData);
  const deleteMcp = useMcpSelector((s) => s.deleteMcp);

  const [mcpService] = useState(McpBridgeFactory.getInstance());
  const getList = () => {
    getMcpListByCategoryId(selectCategory?.id!);
  };

  useEffect(() => {
    if (selectCategory) {
      getList();
    }
  }, [selectCategory?.id]);

  if (!selectCategory) {
    return <Empty description="请先选择分类" />;
  }
  console.log('evo=>mcp-list', mcpList?.data);
  return (
    <div className={s.container}>
      <ProList
        rowClassName="ant-pro-list-item"
        dataSource={mcpList?.data || []}
        metas={{
          title: {
            dataIndex: 'name',
          },
          description: {
            dataIndex: 'description',
          },
          subTitle: {
            render: (_, record) => (
              <Tag color={record.type === EMcpType.STDIO ? 'blue' : 'green'}>
                {record.type === EMcpType.STDIO ? '标准输入/输出' : '服务器发送事件'}
              </Tag>
            ),
          },
          actions: {
            render: (_, record) => {
              return (
                <Space split={<Divider type="vertical" />} size={0}>
                  <McpEnableSwitch record={record} onUpdateSuccess={() => {}} />
                  <McpTools record={record} />
                  <a
                    key="edit"
                    onClick={() =>
                      setDialogData({
                        open: true,
                        type: 'update',
                        data: record,
                      })
                    }
                  >
                    编辑
                  </a>
                  <a
                    key="delete"
                    style={{ color: 'var(--evo-color-error-text)' }}
                    onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除 "${record.name}" 吗？`,
                        okText: '确认',
                        cancelText: '取消',
                        onOk: async () => {
                          const res = await deleteMcp(record.id);
                          if (res.success) {
                            message.success('删除成功');
                          } else {
                            message.error(res.error || '删除失败');
                          }
                        },
                      });
                    }}
                  >
                    删除
                  </a>
                </Space>
              );
            },
          },
        }}
      />
    </div>
  );
};
