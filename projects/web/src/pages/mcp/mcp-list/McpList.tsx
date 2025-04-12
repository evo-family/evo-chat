import React, { FC, useEffect } from 'react';
import { ProList } from '@ant-design/pro-components';
import { Button, Empty, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMcpSelector } from '../mcp-processor/McpProvider';
import { EMcpType } from '@evo/types';
import s from './McpList.module.scss';

export const McpList: FC = () => {
  const mcpList = useMcpSelector((s) => s.mcpListResult || []);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const getMcpListByCategoryId = useMcpSelector((s) => s.getMcpListByCategoryId);
  const setDialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.setDialogData);

  useEffect(() => {
    if (selectCategory) {
      getMcpListByCategoryId(selectCategory.id);
    }
  }, [selectCategory?.id]);

  if (!selectCategory) {
    return <Empty description="请先选择分类" />;
  }

  return (
    <div className={s.container}>
      <ProList
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
            render: (_, record) => [
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() =>
                  setDialogData({
                    open: true,
                    ...record,
                  } as any)
                }
              >
                编辑
              </Button>,
              <Button
                key="delete"
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  // TODO: 实现删除功能
                }}
              >
                删除
              </Button>,
            ],
          },
        }}
      />
    </div>
  );
};
