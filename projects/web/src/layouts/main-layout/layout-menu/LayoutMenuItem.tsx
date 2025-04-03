import React, { FC } from 'react';
import { IMenuDataItem } from '../../../hooks/data/useMenuData';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import s from './LayoutMenu.module.scss';
import { EvoIcon, useAntdToken } from '@evo/component';
import { theme, Tooltip } from 'antd';
export interface LayoutMenuItemProps {
  data: IMenuDataItem;
  active: boolean;
}

export const LayoutMenuItem: FC<LayoutMenuItemProps> = (props) => {
  const { data, active } = props;

  const token = useAntdToken();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(data.path);
  };

  const activeStyle = {
    // color: token.colorTextSecondary,
    color: token.colorText,
  };

  return (
    <Tooltip placement="right" title={data.name}>
      <div
        onClick={handleClick}
        style={{
          borderRadius: token.borderRadius,
          backgroundColor: active ? token.controlItemBgHover : 'unset',
        }}
        className={classNames(s.item, {}, 'app-region-no-drag')}
      >
        <EvoIcon
          type={data.icon}
          style={
            active
              ? activeStyle
              : {
                  color: token.colorTextSecondary,
                }
          }
        />
      </div>
    </Tooltip>
  );
};
