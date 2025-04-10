import { Avatar, Dialog, List, NavBar, Space, SwipeAction } from 'antd-mobile';
import { ChatWindow, useChatList, useGlobalCtx } from '@evo/data-store';
import { MoreOutline, SearchOutline } from 'antd-mobile-icons';
import React, { FC, memo, useLayoutEffect, useMemo, useState } from 'react';

import { ChatItemMenu } from './chat-item-menu/ChatItemMenu';
import { EvoIcon } from '@evo/component';
import cxb from 'classnames/bind';
import { debounce } from 'lodash';
import style from './ChatList.module.scss';
import { useHomeSelector } from '../home-processor/HomeProvider';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router';

const cx = cxb.bind(style);

// import { ChatListHeader } from '../../chat/chat-list-header/ChatListHeader';

interface IMessage {
  id: string;
  content: string | React.ReactNode;
  date: string;
  time: string;
  chatIns: ChatWindow;
}

export interface IChatListProps {}

export const ChatList: FC<IChatListProps> = memo(({}) => {
  const navigate = useNavigate();
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);

  const { chatList, groupedChatList } = useChatList();

  const handleSearch = useMemoizedFn(() => {
    console.log('打开搜索');
  });

  const handleNewChat = useMemoizedFn(() => {
    chatCtrl.createWindow();
  });

  const right = (
    <Space style={{ fontSize: 24, '--gap': '16px' }}>
      <EvoIcon
        size={'small'}
        onClick={handleSearch}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-search"
      />
      <EvoIcon
        size={'small'}
        onClick={handleNewChat}
        style={{ color: 'var(--adm-color-text)' }}
        type="icon-message"
      />
    </Space>
  );

  return (
    <Space direction="vertical" style={{ width: '100%', height: '100%' }}>
      <NavBar right={right} back={null} />

      <Space
        direction="vertical"
        style={{
          flex: 1,
          overflow: 'auto',
          width: 'calc(100% - 20px)',
          padding: '0 10px',
        }}
      >
        <List className={cx('chat-list')}>
          {groupedChatList.flatMap((record) => [
            <List.Item className={cx('chat-group')} key={record.groupName}>
              <Space align="center">{record.groupName}</Space>
            </List.Item>,
            record.chats.map((chatInfo) => (
              <SwipeAction
                key={chatInfo.id}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: async () => {
                      const result = await Dialog.confirm({
                        content: '确定要删除该对话吗？',
                      });
                      if (result) {
                        chatCtrl.removeWindow(chatInfo.id);
                      }
                    },
                  },
                ]}
              >
                <List.Item
                  className={cx('chat-item')}
                  arrowIcon={false}
                  onClick={() => {
                    chatCtrl.setCurrentWin(chatInfo.id);
                    navigate(`/chat`);
                  }}
                >
                  <Space align="center">{chatInfo.title}</Space>
                </List.Item>
              </SwipeAction>
            )),
          ])}
        </List>
      </Space>
    </Space>
  );
});
