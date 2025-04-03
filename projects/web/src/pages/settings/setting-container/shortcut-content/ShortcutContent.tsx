import React, { FC } from 'react';
import { Switch } from 'antd';
import { SettingGroup } from '../../../../components';

export const ShortcutContent: FC = React.memo(() => {
  return (
    <>
      <SettingGroup
        title="对话快捷键"
      >
        <SettingGroup.Item
          title="发送消息"
          description="Enter 发送，Shift + Enter 换行"
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>Enter</span>
            <Switch />
          </div>
        </SettingGroup.Item>
        <SettingGroup.Item
          title="停止生成"
          description="停止 AI 的消息生成"
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>Esc</span>
            <Switch />
          </div>
        </SettingGroup.Item>
      </SettingGroup>

      <SettingGroup
        title="窗口快捷键"
      >
        <SettingGroup.Item
          title="新建会话"
          description="创建新的对话窗口"
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>⌘ + N</span>
            <Switch />
          </div>
        </SettingGroup.Item>
        <SettingGroup.Item
          title="关闭会话"
          description="关闭当前对话窗口"
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>⌘ + W</span>
            <Switch />
          </div>
        </SettingGroup.Item>
        <SettingGroup.Item
          title="切换会话"
          description="在不同会话间切换"
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>⌘ + 数字键</span>
            <Switch />
          </div>
        </SettingGroup.Item>
      </SettingGroup>
    </>
  );
});