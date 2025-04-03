import React, { FC } from 'react';
import { Switch } from 'antd';
import { SettingPanel, SettingPanelItem } from '@evo/component';

export interface IKnowledgePageProps {
  children?: React.ReactNode;
}

export const KnowledgePage: FC<IKnowledgePageProps> = props => {

  return (
    <div>
      <SettingPanel>
        <SettingPanelItem direction='vertical' title="模型参数配置">
          <Switch size='small'></Switch>
        </SettingPanelItem>

        <SettingPanelItem direction='horizontal' title="模型参数配置">
          <Switch size='small'></Switch>
        </SettingPanelItem>

        <SettingPanelItem titleSize='large' direction='horizontal' title="模型参数配置">
          <Switch size='small'></Switch>
        </SettingPanelItem>

        <SettingPanelItem titleSize='small' direction='horizontal' title="模型参数配置">
          <Switch size='small'></Switch>
        </SettingPanelItem>
      </SettingPanel>
    </div>
  );
}

