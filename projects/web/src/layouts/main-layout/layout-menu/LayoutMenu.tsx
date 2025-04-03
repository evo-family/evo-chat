import React, { FC, useMemo } from 'react';
import { useMenuData } from '../../../hooks/data/useMenuData';
import { LayoutMenuItem } from './LayoutMenuItem';
import s from './LayoutMenu.module.scss';
import { useNavigate, useLocation } from 'react-router';
import { Avatar, Button, ConfigProvider, Menu, Tooltip, theme } from 'antd';
import { MoonOutlined, SearchOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useGlobalCtx, useSettingSelector } from '@evo/data-store';
import { EThemeMode } from '@evo/types';

export interface ILayoutMenuProps {
}

export const LayoutMenu: FC<ILayoutMenuProps> = props => {
  const menuData = useMenuData();
  const navigate = useNavigate();
  const location = useLocation()
  const [theme, setTheme] = useSettingSelector(s => [s.theme, s.setTheme])
  const handleTheme = () => {
    setTheme?.(theme === EThemeMode.Dark ? EThemeMode.Light : EThemeMode.Dark)
  }
  return (
    <div className={s.menu}>
      <div>
        <Avatar style={{ marginBottom: 20 }} icon={<UserOutlined />} />
        {
          menuData.map(item => {
            return <LayoutMenuItem key={item.id} active={location.pathname === item.path} data={item} />
          })
        }
      </div>

      <div className={classNames(s.bottom, 'app-region-no-drag')}>
        <Tooltip placement="right" title={"切换主题"}>
          <Button onClick={handleTheme} type="text" shape="circle" size='large' icon={<MoonOutlined />} />
        </Tooltip>

        <Tooltip placement="right" title={"设置"}>
          <Button onClick={() => navigate('/settings')} type="text" shape="circle" size='large' icon={<SettingOutlined />} />
        </Tooltip>
      </div>

    </div>
  );
}

