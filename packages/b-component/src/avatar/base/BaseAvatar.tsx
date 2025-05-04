import React, { ReactNode } from 'react';

import cxb from 'classnames/bind';
import style from './BaseAvatar.module.scss';

const cx = cxb.bind(style);

export interface IBaseAvatarProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  content?: ReactNode | string;
}

export const BaseAvatar = React.memo<IBaseAvatarProps>((props) => {
  const { className, width = 32, height = width, content } = props;

  return (
    <div className={cx(['base-avatar', className])} style={{ width, height }}>
      {content}
    </div>
  );
});
