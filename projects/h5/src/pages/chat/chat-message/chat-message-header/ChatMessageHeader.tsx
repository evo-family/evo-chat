import React, { FC, useEffect, useState } from 'react';
import { NavBar, Space } from 'antd-mobile';
import { LeftOutline, AddOutline, SetOutline  } from 'antd-mobile-icons';
import s from './ChatMessageHeader.module.scss';
import classNames from 'classnames';
import { useHomeSelector } from '../../../home/home-processor/HomeProvider';
import { EvoIcon, useAntdToken } from '@evo/component';
import { useNavigate } from 'react-router';
import { useChatWinCtx, useGlobalCtx } from '@evo/data-store';
import { useCellValue } from '@evo/utils';

interface IChatMessageHeaderProps {
}

export const ChatMessageHeader: FC<IChatMessageHeaderProps> = ({}) => {
  const navigate = useNavigate();
  const [chatTitle, setChatTitle] = useState('');

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  useEffect(() => {
  const subscriber = chatWin.title.listen(
    (notice) => {
      console.debug('chatInfo todo_lcf 2222 待调试 chatWin.title notice: ', notice);
      if (!notice.next) return;
      setChatTitle(notice.next);
    },{ immediate: true }
  );

  return () => subscriber.unsubscribe();
  }, [])

  const back = (
    <div onClick={() => {navigate('/home')}}>
      <LeftOutline fontSize={24} color='#222222' />
    </div>
  );

  const right = (
    <Space style={{ fontSize: 24, '--gap': '16px' }}>
      <EvoIcon size={'small'} style={{color: 'var(--adm-color-text)'}} type="icon-copy" />
      <EvoIcon size={'small'} style={{color: 'var(--adm-color-text)'}} type="icon-message" />
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