import React, { ReactNode } from 'react';

import cxb from 'classnames/bind';
import style from './BaseAvatar.module.scss';

const cx = cxb.bind(style);

export interface IBaseAvatarProps {
  clasName?: string;
  width?: string | number;
  height?: string | number;
  content?: ReactNode;
}

export const BaseAvatar = React.memo<IBaseAvatarProps>((props) => {
  const { clasName, width = 32, height = width, content } = props;

  return (
    <div className={cx(['base-avatar', clasName])} style={{ width, height }}>
      {content}
    </div>
  );
});
