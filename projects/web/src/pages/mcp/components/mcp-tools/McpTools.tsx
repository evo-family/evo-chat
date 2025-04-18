import React, { FC, useEffect, useState } from 'react';
import { Drawer, Collapse, Descriptions, Tag, message } from 'antd';
import { JsonSchemaType } from './types';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { IMcpMeta } from '@evo/types';
import { ProDescriptions } from '@ant-design/pro-components';

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
      const res = await McpBridgeFactory.getInstance().getTools(record.id);
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
                <>
                  <strong>{tool.name}</strong>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                    {tool.description}
                  </div>
                </>
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
