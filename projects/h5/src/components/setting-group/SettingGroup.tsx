import { List } from 'antd';
import classNames from 'classnames';
import React, { FC, memo } from 'react';
import s from './SettingGroup.module.scss';
import { SettingGroupItem } from './setting-group-item/SettingGroupItem';

export interface ISettingGroupProps {
  style?: React.CSSProperties;
  className?: string
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const SettingGroup = (props: ISettingGroupProps) => {
  const { style, className, title, description } = props;
  return (
    <List
      size='small'
      style={style}
      className={classNames(s.group, className)}
      header={
        <div>
          <h4 style={{ margin: 0 }}>{title}</h4>
          {description && (
            <div style={{ fontSize: '12px', color: 'var(--evo-color-text-quaternary)', marginTop: 4 }}>
              {description}
            </div>
          )}
        </div>
      }
      bordered
    >
      {props.children}
    </List>
  );
}


SettingGroup.Item = SettingGroupItem;
