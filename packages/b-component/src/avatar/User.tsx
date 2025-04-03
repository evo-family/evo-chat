import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import style from './Avatar.module.scss';

export interface IUserAvatarProps {
  width?: string | number;
  height?: string | number;
}

export const UserAvatar = React.memo<IUserAvatarProps>((props) => {
  const { width = 32, height = width } = props;
  return (
    <div className={style.container} style={{ width, height }}>
      <UserOutlined />
    </div>
  );
});
