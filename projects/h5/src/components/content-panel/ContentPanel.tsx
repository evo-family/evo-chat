import { useAntdToken } from '@evo/component';
import React, { FC } from 'react';
import s from './ContentPanel.module.scss';
import classNames from 'classnames';
import { NavBar } from 'antd-mobile';

export interface IContentPanelProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  toolbar?: React.ReactElement;
  /**
   * 隐藏nav bar的返回按钮
   */
  hiddenToolbarBack?: boolean;
  /**
   * 返回按钮
   * @returns
   */
  onBack?: () => void;
}

export const ContentPanel: FC<IContentPanelProps> = (props) => {
  const { style, className, title, toolbar, hiddenToolbarBack, onBack } = props;
  const token = useAntdToken();

  return (
    <div className={classNames(s.container, className)} style={style}>
      <div className={s.header}>
        <NavBar
          right={toolbar}
          back={hiddenToolbarBack ? null : undefined}
          onBack={onBack}
        >
          {title}
        </NavBar>
      </div>
      <div
        style={{
          backgroundColor: token.colorBgContainer,
        }}
        className={s.body}
      >
        {props.children}
      </div>
    </div>
  );
};
