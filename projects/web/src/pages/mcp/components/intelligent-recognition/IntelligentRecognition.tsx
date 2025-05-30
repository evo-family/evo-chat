import { Button, Input, message } from 'antd';
import React, { FC, memo, useState } from 'react';

import { ButtonWrapper } from '@evo/component';
import { EMcpType } from '@evo/types';
import { IFormData } from '../add-or-update/AddOrUpdateMcp';

export interface IIntelligentRecognitionData extends Partial<IFormData> {
  name: string;
  description: string;
}

export interface IIntelligentRecognitionProps {
  onRecognition?: (data: IIntelligentRecognitionData) => void;
}

export const IntelligentRecognition: FC<IIntelligentRecognitionProps> = memo((props) => {
  const [visible, setVisible] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState<string>();
  const handleRecognition = () => {
    try {
      const value = textAreaValue!;
      if (!value) {
        message.info('请输入要识别的内容');
        return;
      }
      // 预处理 JSON 字符串，移除尾随逗号
      const cleanedValue = value.replace(/,(\s*[}\]])/g, '$1');
      // 尝试解析 JSON
      const data = JSON.parse(cleanedValue);
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
      let recognitionData: IIntelligentRecognitionData;
      if (serverConfig?.type?.toLocaleLowerCase() === 'sse') {
        recognitionData = {
          name: serverName,
          description: `MCP Server for ${serverName}`,
          type: EMcpType.SSE,
          url: serverConfig?.url,
        };
      } else {
        recognitionData = {
          name: serverName,
          description: `MCP Server for ${serverName}`,
          command: serverConfig.command || 'npx',
          type: EMcpType.STDIO,
          args: Array.isArray(serverConfig.args) ? serverConfig.args.join('\n') : '',
          env: Object.entries(serverConfig?.env || {}).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        };
      }

      props.onRecognition?.(recognitionData);
      message.success('识别成功');
      setVisible(false);
    } catch (error) {
      console.log(error);
      message.error('请输入有效的 JSON 格式');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {visible && (
        <ButtonWrapper
          buttonNode={
            <Button onClick={handleRecognition} type="default" style={{ width: '100%' }}>
              识别MCP地址
            </Button>
          }
        >
          <Input.TextArea
            rows={12}
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value!)}
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
