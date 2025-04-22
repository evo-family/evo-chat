import React, { FC } from 'react';

import { Button } from 'antd';
import { EvoIcon } from '@evo/component';
import { SearchChat } from '../chat-search/ChatSearch';
import classNames from 'classnames';
import s from './ChatListHeader.module.scss';

interface IChatListHeaderProps {
  onNewChat?: () => void;
}

export const ChatListHeader: FC<IChatListHeaderProps> = ({ onNewChat }) => {
  return (
    <div className={s.header}>
      <Button
        className={classNames('evo-button-icon')}
        onClick={onNewChat}
        variant="filled"
        color="default"
        icon={<EvoIcon size={'small'} type="icon-message" />}
      >
        <span style={{ fontSize: 13 }}>开启新对话</span>
      </Button>
      <div className={s.actions}>
        <SearchChat />
      </div>
    </div>
  );
};
