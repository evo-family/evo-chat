import React, { FC, memo } from 'react';
import { IBaseAvatarProps } from '../base/BaseAvatar';
import s from './Styles.module.scss';
import classNames from 'classnames';

export interface IAssistantAvatarProps extends Omit<IBaseAvatarProps, 'content'> {
  avatar: string;
}

export const AssistantAvatar: FC<IAssistantAvatarProps> = memo((props) => {
  const { avatar, width, height = width, className } = props;
  if (!avatar) {
    return <></>;
  }

  // 判断是否为URL或Blob链接
  const isImageUrl =
    avatar.startsWith('http') || avatar.startsWith('blob') || avatar.startsWith('data:');

  if (isImageUrl) {
    return (
      <img
        style={{ width, height }}
        className={classNames(s['assistant-avatar-img'], className)}
        src={avatar}
        alt="avatar"
      />
    );
  }

  return (
    <span
      style={{ width, height, fontSize: width }}
      className={classNames(s['assistant-avatar-emoji'], className)}
    >
      {avatar}
    </span>
  );
});
