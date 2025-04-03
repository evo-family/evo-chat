import React, { FC } from 'react';
import classNames from 'classnames';
import s from './SettingPanel.module.scss';

export interface ISettingPanelProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  title?: React.ReactNode;
}

export const SettingPanel: FC<ISettingPanelProps> = (props) => {
  const { style, className, children, title } = props;

  return (
    <div style={style} className={classNames(s.panel, className)}>
      {title && <div className={classNames(s.title)}>{title}</div>}
      {children}
    </div>
  );
};
