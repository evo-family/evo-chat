import React, { FC, memo } from 'react';

import { Chat, EvoIcon } from '@evo/component';
import { ContentPanel } from '../../../components';
import { useNavigate } from 'react-router';
import { Space } from 'antd-mobile';
import { useTitle } from '../hooks/useTitle';
import s from './ChatMessage.module.scss';

export interface IChatMessageProps {}

export const ChatMessage: FC<IChatMessageProps> = memo(({}) => {
  const navigate = useNavigate();
  const title = useTitle();
  const onBack = () => {
    navigate('/home');
  };

  const right = (
    <Space>
      <EvoIcon size={'small'} type="icon-copy" />
      <EvoIcon size={'small'} type="icon-message" />
    </Space>
  );
  return (
    <ContentPanel title={title} onBack={onBack} toolbar={right}>
      <Chat className={s.chat} messageListClassName={s.messageList} />
    </ContentPanel>
  );
});
