import { BaseAvatar, IBaseAvatarProps } from '../base/BaseAvatar';

import React from 'react';
import { UserOutlined } from '@ant-design/icons';

export interface IUserAvatarProps extends Omit<IBaseAvatarProps, 'content'> {}

export const UserAvatar = React.memo<IUserAvatarProps>((props) => {
  const { width, height } = props;

  return <BaseAvatar width={width} height={height} content={<UserOutlined />} />;
});
