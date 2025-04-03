import { Splitter } from 'antd';
import React, { FC } from 'react';
import s from './SplitterPanel.module.scss';
import { useAntdToken } from '@evo/component';
import { useSettingSelector } from '@evo/data-store';

export interface ISplitterPanelProps {
  /**
   * 左侧内容
   */
  leftContent: React.ReactNode;
  leftVisible?: boolean;
  children?: React.ReactNode;
}

export const SplitterPanel: FC<ISplitterPanelProps> = (props) => {
  const { leftContent, children, leftVisible } = props;
  const layout = useSettingSelector((s) => s.layout);
  const token = useAntdToken();
  return (
    <Splitter className={s.splitter}>
      <Splitter.Panel
        className={s.leftPanel}
        defaultSize={260}
        min={200}
        max="70%"
        size={leftVisible ? 0 : undefined}
      >
        {leftContent}
      </Splitter.Panel>
      <Splitter.Panel
        className={s.message}
        style={{
          // backgroundColor: layout === ELayout.l2 ? token.colorBgLayout : token.colorBgContainer,
          backgroundColor: token.colorBgLayout,
          // border: `1px solid ${token.colorSplit}`,
        }}
      >
        {children}
      </Splitter.Panel>
    </Splitter>
  );
};
