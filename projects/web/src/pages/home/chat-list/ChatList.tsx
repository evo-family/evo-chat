import {
  ChatWindow,
  IChatListItem,
  useChatList,
  useGlobalCtx,
  useSettingSelector,
} from '@evo/data-store';
import { DataCell, useCellValue } from '@evo/utils';
import { IN_30_DAY_TEXT, IN_7_TEXT, MORE_EARLY_TEXT, TODAY_TEXT } from '@evo/utils';
import { Menu, Modal } from 'antd';
import React, { FC, memo, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useUpdate } from 'ahooks';

import { ChatItemMenu } from './chat-item-menu/ChatItemMenu';
import { ChatListHeader } from './chat-list-header/ChatListHeader';
import { MenuItem } from '@evo/component';
import type { MenuProps } from 'antd';
import s from './ChatList.module.scss';
import { useHomeSelector } from '../home-processor/HomeProvider';

export interface IChatListProps {}

export const ChatList: FC<IChatListProps> = memo((props) => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);
  const defaultMessageModel = useSettingSelector((s) => s.defaultMessageModel);

  const { groupedChatList } = useChatList();

  const selectedKeys = useMemo(() => [curWinId], [curWinId]);

  const handleMenuAction = useMemoizedFn(async (winId: string, action: string) => {
    switch (action) {
      case 'rename':
        console.log('重命名:', winId);
        break;
      case 'export_md':
        console.log('导出到 Markdown:', winId);
        break;
      case 'export_image':
        console.log('导出到图片:', winId);
        break;
      case 'delete':
        chatCtrl.removeWindow(winId);
        console.log('删除:', winId);
        break;
    }
  });

  const handleSelect: MenuProps['onSelect'] = useMemoizedFn((info) => {
    const { key } = info;

    chatCtrl.setCurrentWin(key);
  });

  const handleNewChat = useMemoizedFn(async () => {
    const win = await chatCtrl.createWindow();
    if (!defaultMessageModel) {
      // TODO 待完善，弹框设置
      Modal.confirm({
        title: '未设置默认模型',
        content: '您还没有设置默认会话模型，需要先设置默认模型才能开始对话',
        okText: '去设置',
        cancelText: '取消',
        onOk: () => {},
      });
      return;
    }
    win.updateConfigModels([defaultMessageModel]);
  });

  const menus: MenuProps['items'] = useMemo(() => {
    return groupedChatList.map((record) => {
      return {
        key: record.groupName,
        label: record.groupName,
        type: 'group',
        children: record.chats.map((chatInfo) => ({
          key: chatInfo.id,
          label: (
            <>
              <MenuItem
                name={chatInfo.title}
                operationContent={
                  <ChatItemMenu onAction={handleMenuAction} chatIns={chatInfo.chatIns} />
                }
              />
            </>
          ),
        })),
      };
    });
  }, [groupedChatList]);

  return (
    <div className={s.container}>
      <ChatListHeader onNewChat={handleNewChat} />
      <Menu
        className={'evo-menu'}
        mode="inline"
        items={menus}
        onSelect={handleSelect}
        selectedKeys={selectedKeys}
      />
    </div>
  );
});
