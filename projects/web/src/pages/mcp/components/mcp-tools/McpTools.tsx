import { Collapse, Descriptions, Drawer, Tag, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';

import { IMcpMeta } from '@evo/types';
import { JsonSchemaType } from './types';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { ProDescriptions } from '@ant-design/pro-components';
import { Switch } from 'antd'; // 添加 Switch 导入

interface IMcpToolsProps {
  record: IMcpMeta;
}

export const McpTools: FC<IMcpToolsProps> = ({ record }) => {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<
    Array<{
      name: string;
      description: string;
      inputSchema: JsonSchemaType;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchTools = async () => {
    if (!open || !record?.id) return;

    setLoading(true);
    try {
      const res = await McpBridgeFactory.getInstance().getTools({
        mcpId: record.id,
      });
      if (res.success) {
        setTools(res.data as any);
      } else {
        message.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [open, record?.id]);

  const [closedTools, setClosedTools] = useState<string[]>(() => {
    try {
      return JSON.parse(record.closeTools || '[]');
    } catch {
      return [];
    }
  });

  const handleToolSwitch = async (checked: boolean, toolName: string) => {
    const newClosedTools = checked
      ? closedTools.filter((t) => t !== toolName)
      : [...closedTools, toolName];

    try {
      const { categoryName, ...rest } = record;
      const params = {
        ...rest,
        closeTools: JSON.stringify(newClosedTools),
      };

      const res = await McpBridgeFactory.getInstance().updateMcp(params);

      if (res.success) {
        setClosedTools(newClosedTools);
      } else {
        message.error(res.error);
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  return (
    <>
      <a onClick={() => setOpen(true)}>工具</a>
      <Drawer
        title="可用工具"
        placement="right"
        width={600}
        onClose={() => setOpen(false)}
        getContainer={() => document.querySelector('.mcp-container')!}
        style={{ position: 'absolute' }}
        rootStyle={{ position: 'absolute' }}
        open={open}
        loading={loading}
        maskStyle={{ backgroundColor: 'transparent' }}
      >
        <Collapse>
          {tools.map((tool) => (
            <Collapse.Panel
              key={tool.name}
              header={
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <strong>{tool.name}</strong>
                    <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                      {tool.description}
                    </div>
                  </div>
                  <Switch
                    size="small"
                    checked={!closedTools.includes(tool.name)}
                    onChange={(checked, event) => {
                      event?.stopPropagation();
                      handleToolSwitch(checked, tool.name);
                    }}
                    onClick={(c, e) => e.stopPropagation()}
                  />
                </div>
              }
            >
              <ProDescriptions title="请求参数" column={1} bordered>
                {Object.entries(tool.inputSchema.properties).map(([key, value]: [string, any]) => (
                  <ProDescriptions.Item
                    key={key}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{key}</span>
                        {tool.inputSchema.required?.includes(key) && <Tag color="error">必需</Tag>}
                      </div>
                    }
                    valueType="text"
                    labelStyle={{ color: '#1677ff' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag>{value.type}</Tag>
                      <span>{value.description}</span>
                    </div>
                  </ProDescriptions.Item>
                ))}
              </ProDescriptions>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Drawer>
    </>
  );
};
