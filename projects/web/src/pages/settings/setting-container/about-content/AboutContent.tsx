import React, { FC } from 'react';
import { SettingGroup } from '../../../../components';
import { Button, Flex, Space, Switch } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { IPC_EVENTS } from '@evo/utils';
import { useGlobalCtx, useSettingSelector } from '@evo/data-store';
import { Update } from './Update';

export const AboutContent: FC = React.memo(() => {
  const about = useSettingSelector((s) => s.about);
  const setAbout = useSettingSelector((s) => s.setAbout);
  const [isElectron] = useGlobalCtx((ctx) => ctx.envProcessor.isElectron);
  return (
    <>
      <SettingGroup title="应用信息">
        <SettingGroup.Item
          title={
            <Space>
              Evo Chat
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--evo-color-primary)',
                  fontWeight: 500,
                  background: 'var(--evo-color-primary-bg)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {about.version}
              </div>
            </Space>
          }
          description="一款现代化的开源 AI 对话平台"
        >
          {isElectron ? <Update /> : null}
        </SettingGroup.Item>
        {isElectron && (
          <SettingGroup.Item title="自动检查更新" description="启动时自动检查新版本">
            <Switch
              checked={about.isAutoUpdate}
              onChange={(checked) => {
                setAbout({
                  isAutoUpdate: checked,
                });
              }}
            />
          </SettingGroup.Item>
        )}
      </SettingGroup>

      <SettingGroup title="开源信息">
        <SettingGroup.Item title="开源协议" description="本项目基于 MIT 协议开源">
          <Button
            type="link"
            href="https://github.com/evo-family/evo-chat/blob/main/LICENSE"
            target="_blank"
          >
            查看协议
          </Button>
        </SettingGroup.Item>
        <SettingGroup.Item title="项目仓库" description="欢迎访问项目仓库并参与贡献">
          <Button
            icon={<GithubOutlined />}
            href="https://github.com/evo-family/evo-chat"
            target="_blank"
            style={{ marginLeft: 8 }}
          />
        </SettingGroup.Item>
      </SettingGroup>

      <SettingGroup title="问题反馈">
        <SettingGroup.Item title="提交问题" description="如果遇到 Bug 或有新功能建议">
          <Button type="link" href="https://github.com/evo-family/evo-chat/issues" target="_blank">
            提交 Issue
          </Button>
        </SettingGroup.Item>
      </SettingGroup>
    </>
  );
});
