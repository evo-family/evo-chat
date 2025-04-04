import React, { FC, memo } from 'react';
import s from './ContentPanel.module.scss';
import { Button, Flex } from 'antd';
import { useAntdToken } from '@evo/component';

export interface IContentPanelProps {
  title: string;
  subTitle?: string;
  toolbar?: React.ReactElement;
  leftContent?: React.ReactNode;
  leftStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ContentPanel: FC<IContentPanelProps> = memo((props) => {
  const { title, toolbar, leftContent, children, leftStyle } = props;
  const token = useAntdToken();
  return (
    <div className={s.container}>
      <div className={`${s.toolbar} app-region-drag`}>
        <Flex justify="space-between" align="center">
          <div>
            <div className={s.title}>{title}</div>
            {props.subTitle && <div className={s.subTitle}>{props.subTitle}</div>}
          </div>
          {toolbar}
        </Flex>
      </div>
      <div className={s.content}>
        <div style={leftStyle} className={s.left}>
          {leftContent}
        </div>
        <div
          className={s.right}
          style={{
            backgroundColor: token.colorBgContainer,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
