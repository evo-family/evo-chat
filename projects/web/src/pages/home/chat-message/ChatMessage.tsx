import { Drawer, Splitter } from 'antd';
import React, { FC, memo, useEffect, useState } from 'react';

import { Chat } from '@evo/component';
import { ChatMessageHeader } from './chat-message-header/ChatMessageHeader';
import { SettingMessage } from '../../../components';
import s from './ChatMessage.module.scss';
import { useHomeSelector } from '../home-processor/HomeProvider';

export interface IChatMessageProps {}

export const ChatMessage: FC<IChatMessageProps> = memo(({}) => {
  const [drawerVisible, collapseDrawer] = useHomeSelector((s) => [
    s.drawerVisible,
    s.collapseDrawer,
  ]);

  return (
    <div className={s.container}>
      <ChatMessageHeader />
      <div className={s.content}>
        <Splitter>
          <Splitter.Panel>
            <Chat />
          </Splitter.Panel>
        </Splitter>

        <Drawer
          title="设置"
          placement="right"
          onClose={() => collapseDrawer()}
          open={drawerVisible}
          width={400}
          getContainer={false}
          style={{ position: 'absolute' }}
          rootStyle={{ position: 'absolute' }}
        >
          <SettingMessage />
        </Drawer>
      </div>
    </div>
  );
});
