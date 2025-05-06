import { Button, Card, Flex, List, Select, theme, Modal } from 'antd';
import React, { FC } from 'react';

import { SettingGroup } from '../../../../components';
import { languageData, themeColorData, useGlobalCtx, useSettingSelector } from '@evo/data-store';
import { EThemeMode } from '@evo/types';
import { DefaultModelSelect } from './DefaultModelSelect';

export interface IGeneralContentProps {}

export const GeneralContent: FC<IGeneralContentProps> = React.memo((props) => {
  const [theme, setTheme] = useSettingSelector((s) => [s.theme, s.setTheme]);
  const [themeColorId, setThemeColorId] = useSettingSelector((s) => [
    s.themeColorId,
    s.setThemeColorId,
  ]);
  const [language, setLanguage] = useSettingSelector((s) => [s.language, s.setLanguage]);
  const [defaultMessageModel, setDefaultMessageModel] = useSettingSelector((s) => [
    s.defaultMessageModel,
    s.setDefaultMessageModel,
  ]);
  const [defaultRenameModel, setDefaultRenameModel] = useSettingSelector((s) => [
    s.defaultRenameModel,
    s.setDefaultRenameModel,
  ]);

  return (
    <>
      <SettingGroup title="基础设置">
        <SettingGroup.Item title="主题" description="设置应用的明暗主题模式">
          <Select
            value={theme}
            style={{ width: 200 }}
            onChange={setTheme}
            options={[
              { value: EThemeMode.System, label: '跟随系统' },
              { value: EThemeMode.Light, label: '浅色' },
              { value: EThemeMode.Dark, label: '深色' },
            ]}
          />
        </SettingGroup.Item>

        <SettingGroup.Item title="主题色" description="自定义应用的主题色调">
          <Select
            value={themeColorId}
            style={{ width: 200 }}
            options={themeColorData}
            onChange={setThemeColorId}
          />
        </SettingGroup.Item>

        <SettingGroup.Item title="语言" description="设置应用界面显示的语言">
          <Select
            value={language}
            style={{ width: 200 }}
            options={languageData}
            onChange={setLanguage}
          />
        </SettingGroup.Item>
      </SettingGroup>

      {/* <SettingGroup title="消息设置">
        <SettingGroup.Item title="气泡形状">
          <Select
            defaultValue="default"
            style={{ width: 200 }}
            options={[
              { value: 'default', label: '默认' },
              { value: 'round', label: '圆角' },
              { value: 'corner', label: '直角' },
            ]}
          />
        </SettingGroup.Item>
      </SettingGroup> */}

      <SettingGroup title="默认模型">
        <SettingGroup.Item title="会话模型" description="设置新建会话时默认使用的AI模型">
          <DefaultModelSelect value={defaultMessageModel} onChange={setDefaultMessageModel} />
        </SettingGroup.Item>
        <SettingGroup.Item title="会话自动命名" description="选择用于自动生成会话标题的AI模型">
          <DefaultModelSelect value={defaultRenameModel} onChange={setDefaultRenameModel} />
        </SettingGroup.Item>
      </SettingGroup>
    </>
  );
});
