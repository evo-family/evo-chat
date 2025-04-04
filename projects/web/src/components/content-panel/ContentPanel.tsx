import React, { FC, memo } from 'react';
import s from './ContentPanel.module.scss';
import { Button, Flex } from 'antd';
import { useAntdToken } from '@evo/component';
import {
  ContentPanelProvider,
  useContentPanelSelector,
} from './content-panel-processor/ContentPanelProvider';

interface IContentPanelContentProps {
  title: string;
  subTitle?: string;
  toolbar?: React.ReactElement;
  leftContent?: React.ReactNode;
  leftStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

const ContentPanelContent: FC<IContentPanelContentProps> = memo((props) => {
  const { title, toolbar, leftContent, children, leftStyle } = props;
  const setToolbarElement = useContentPanelSelector((s) => s.setToolbarElement);
  const token = useAntdToken();
  return (
    <div className={s.container}>
      <div className={`${s.toolbar} app-region-drag`}>
        <Flex justify="space-between" align="center">
          <div>
            <div className={s.title}>{title}</div>
            {props.subTitle && <div className={s.subTitle}>{props.subTitle}</div>}
          </div>
          <div className="app-region-no-drag" ref={setToolbarElement}>
            {toolbar}
          </div>
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

export interface IContentPanelProps extends IContentPanelContentProps {}
export const ContentPanel: FC<IContentPanelProps> = memo((props) => {
  return (
    <ContentPanelProvider>
      <ContentPanelContent {...props} />
    </ContentPanelProvider>
  );
});
