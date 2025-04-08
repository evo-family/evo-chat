import { AddOutline, LeftOutline, SetOutline } from 'antd-mobile-icons';
import { EvoIcon, useAntdToken } from '@evo/component';
import { NavBar, Space } from 'antd-mobile';
import React, { FC, useEffect, useState } from 'react';
import { useChatWinCtx, useGlobalCtx } from '@evo/data-store';

import classNames from 'classnames';
import s from './ChatMessageHeader.module.scss';
import { useCellValue } from '@evo/utils';
import { useHomeSelector } from '../../../home/home-processor/HomeProvider';
import { useNavigate } from 'react-router';

interface IChatMessageHeaderProps {}

export const ChatMessageHeader: FC<IChatMessageHeaderProps> = ({}) => {
  const navigate = useNavigate();
  const [chatTitle, setChatTitle] = useState('');

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  useEffect(() => {
    const subscriber = chatWin.title.listen(
      (notice) => {
        console.debug(
          'chatInfo todo_lcf 2222 待调试 chatWin.title notice: ',
          notice
        );
        if (!notice.next) return;
        setChatTitle(notice.next);
      },
      { immediate: true }
    );

    return () => subscriber.unsubscribe();
  }, []);

  const back = (
    <div
      onClick={() => {
        navigate('/home');
      }}
    >
      <LeftOutline fontSize={24} color="#222222" />
    </div>
  );

  const right = (
    <Space style={{ fontSize: 24, '--gap': '16px' }}>
      <EvoIcon
        size={'small'}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-copy"
      />
      <EvoIcon
        size={'small'}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-message"
      />
    </Space>
  );

  return (
    <NavBar
      className={classNames(s.header, 'app-region-drag')}
      back={back}
      right={right}
      backArrow={false}
    >
      {chatTitle}
    </NavBar>
  );
};
