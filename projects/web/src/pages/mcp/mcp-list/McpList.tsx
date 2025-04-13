import React, { FC, useEffect, useState } from 'react';
import { ProList } from '@ant-design/pro-components';
import { Button, Empty, message, Modal, Tag } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useMcpSelector } from '../mcp-processor/McpProvider';
import { EMcpType } from '@evo/types';
import s from './McpList.module.scss';
import { McpBridgeFactory } from '@evo/platform-bridge';

export const McpList: FC = () => {
  const mcpList = useMcpSelector((s) => s.mcpListResult || []);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const getMcpListByCategoryId = useMcpSelector((s) => s.getMcpListByCategoryId);
  const setDialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.setDialogData);
  const deleteMcp = useMcpSelector((s) => s.deleteMcp);

  const [mcpService] = useState(McpBridgeFactory.getInstance());

  const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectCategory) {
      getMcpListByCategoryId(selectCategory.id);
    }
  }, [selectCategory?.id]);

  if (!selectCategory) {
    return <Empty description="请先选择分类" />;
  }

  // useEffect(() => {
  //   const checkStatus = async () => {
  //     if (mcpList?.data) {
  //       const status: Record<string, boolean> = {};
  //       for (const mcp of mcpList.data) {
  //         const res = await mcpService.getServiceStatus(mcp.id);
  //         status[mcp.id] = res.success;
  //       }
  //       setServiceStatus(status);
  //     }
  //   };
  //   checkStatus();
  // }, [mcpList?.data]);

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
                    type: 'update',
                    data: record,
                  })
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
              </Button>,
              <Button
                key="service"
                type="link"
                icon={serviceStatus[record.id] ? <StopOutlined /> : <PlayCircleOutlined />}
                onClick={async () => {
                  if (serviceStatus[record.id]) {
                    const res = await mcpService.stopService(record.id);
                    if (res.success) {
                      message.success('服务已停止');
                      setServiceStatus((prev) => ({ ...prev, [record.id]: false }));
                    }
                  } else {
                    const res = await mcpService.startService(record.id);
                    if (res.success) {
                      message.success('服务已启动');
                      setServiceStatus((prev) => ({ ...prev, [record.id]: true }));
                    }
                  }
                }}
              >
                {serviceStatus[record.id] ? '停止' : '启动'}
              </Button>,
              <Button
                key="tools"
                type="link"
                icon={<ToolOutlined />}
                onClick={async () => {
                  const res = await mcpService.getTools(record.id);
                  if (res.success) {
                    Modal.info({
                      title: '可用工具',
                      content: (
                        <ul>
                          {res?.data?.map((tool: any) => (
                            <li key={tool.name}>
                              <strong>{tool.name}</strong>: {tool.description}
                            </li>
                          ))}
                        </ul>
                      ),
                      width: 600,
                    });
                  }
                }}
              >
                工具
              </Button>,
            ],
          },
        }}
      />
    </div>
  );
};
