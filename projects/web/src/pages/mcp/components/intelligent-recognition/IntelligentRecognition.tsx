import { ButtonWrapper } from '@evo/component';
import { Button, Input, message } from 'antd';
import React, { FC, memo, useState } from 'react';

export interface IIntelligentRecognitionData {
  name: string;
  description: string;
  command: string;
  args: string;
  env: { key: string; value: string }[];
}

export interface IIntelligentRecognitionProps {
  onRecognition?: (data: IIntelligentRecognitionData) => void;
}

export const IntelligentRecognition: FC<IIntelligentRecognitionProps> = memo((props) => {
  const [visible, setVisible] = useState(false);

  const handleRecognition = (value: string) => {
    try {
      // 尝试解析 JSON
      const data = JSON.parse(value);

      // 验证数据结构
      if (!data.mcpServers || typeof data.mcpServers !== 'object') {
        message.error('无效的 MCP 配置格式');
        return;
      }

      // 获取第一个 MCP 服务器配置
      const serverName = Object.keys(data.mcpServers)[0];
      const serverConfig = data.mcpServers[serverName];

      if (!serverConfig) {
        message.error('未找到有效的 MCP 服务器配置');
        return;
      }

      // 转换为 IIntelligentRecognitionData 格式
      const recognitionData: IIntelligentRecognitionData = {
        name: serverName,
        description: `MCP Server for ${serverName}`,
        command: serverConfig.command || 'npx',
        args: Array.isArray(serverConfig.args) ? serverConfig.args.join('\n') : '',
        env: Object.entries(serverConfig.env || {}).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      };

      props.onRecognition?.(recognitionData);
      message.success('识别成功');
      setVisible(false);
    } catch (error) {
      message.error('请输入有效的 JSON 格式');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {visible && (
        <ButtonWrapper
          buttonNode={
            <Button
              onClick={() => {
                const textArea = document.querySelector('textarea');
                if (textArea) {
                  handleRecognition(textArea.value);
                }
              }}
              type="default"
              style={{ width: '100%' }}
            >
              识别MCP地址
            </Button>
          }
        >
          <Input.TextArea
            rows={12}
            placeholder={`{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}`}
            style={{ border: 'none' }}
          />
        </ButtonWrapper>
      )}

      {!visible && (
        <Button onClick={() => setVisible(true)} type="dashed" style={{ width: '100%' }}>
          智能识别
        </Button>
      )}
    </div>
  );
});
