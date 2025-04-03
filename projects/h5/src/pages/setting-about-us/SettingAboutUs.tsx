import React, { FC } from 'react';
import { SettingGroup } from '../../components/setting-group';
import { Button, NavBar, Switch } from 'antd-mobile';
import { GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

export interface ISettingAboutUsPageProps {}

export const SettingAboutUsPage: FC<ISettingAboutUsPageProps> = () => {
  const navigate = useNavigate();
  return (
    <>
    <NavBar style={{color: 'var(--evo-color-text)'}} onBack={() => {navigate('/settings')}}>
      关于我们
    </NavBar>
    <SettingGroup title="应用信息">
    <SettingGroup.Item
      title="Evo Chat"
      description="一款为创造者而生的 AI 助手"
      extra={<div style={{ fontSize: 12, color: 'var(--evo-color-text-quaternary)' }}>v1.1.10</div>}
    >
      <Button>检查更新</Button>
      <Button icon={<GithubOutlined />} href="https://github.com/evo-family/evo-chat" target="_blank" style={{ marginLeft: 8 }} />
    </SettingGroup.Item>
  </SettingGroup>

  <SettingGroup title="更新设置">
    <SettingGroup.Item
      title="自动检查更新"
      description="启动时自动检查新版本"
    >
      <Switch />
    </SettingGroup.Item>
  </SettingGroup>

  <SettingGroup
    title="开源信息"
  >
    <SettingGroup.Item
      title="开源协议"
      description="本项目基于 MIT 协议开源"
    >
      <Button type="link" href="https://github.com/evo-family/evo-chat/license" target="_blank">
        查看协议
      </Button>
    </SettingGroup.Item>
    <SettingGroup.Item
      title="项目仓库"
      description="欢迎访问项目仓库并参与贡献"
    >
      <Button type="link" href="https://github.com/evo-family/evo-chat" target="_blank">
        访问仓库
      </Button>
    </SettingGroup.Item>
  </SettingGroup>

  <SettingGroup
    title="问题反馈"
  >
    <SettingGroup.Item
      title="提交问题"
      description="如果遇到 Bug 或有新功能建议"
    >
      <Button type="link" href="https://github.com/evo-family/evo-chat/issues" target="_blank">
        提交 Issue
      </Button>
    </SettingGroup.Item>
  </SettingGroup>
</>
  );
};
