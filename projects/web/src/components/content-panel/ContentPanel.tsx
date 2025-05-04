import React, { FC, memo } from 'react';
import s from './ContentPanel.module.scss';
import { Button, Flex } from 'antd';
import { useAntdToken } from '@evo/component';
import {
  ContentPanelProvider,
  useContentPanelSelector,
} from './content-panel-processor/ContentPanelProvider';
import classNames from 'classnames';

interface IContentPanelContentProps {
  title?: string;
  subTitle?: string;
  toolbar?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
  leftContent?: React.ReactNode;
  leftStyle?: React.CSSProperties;
  leftClassName?: string;
  rightStyle?: React.CSSProperties;
  rightClassName?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  children?: React.ReactNode;
  hiddenHeader?: boolean;
}

const ContentPanelContent: FC<IContentPanelContentProps> = memo((props) => {
  const {
    title,
    toolbar,
    leftContent,
    children,
    leftStyle,
    leftClassName,
    rightStyle,
    rightClassName,
    className,
    style,
    contentClassName,
    contentStyle,
    hiddenHeader,
  } = props;
  const setToolbarElement = useContentPanelSelector((s) => s.setToolbarElement);
  const token = useAntdToken();
  return (
    <div className={classNames(s.container, className)} style={style}>
      {!hiddenHeader && (
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
      )}
      <div style={contentStyle} className={classNames(s.content, contentClassName)}>
        <div style={leftStyle} className={`${s.left} ${leftClassName || ''}`}>
          {leftContent}
        </div>
        <div
          className={`${s.right} ${rightClassName || ''}`}
          style={{
            backgroundColor: token.colorBgContainer,
            ...rightStyle,
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
