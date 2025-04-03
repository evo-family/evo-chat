import { Drawer, Splitter } from 'antd';
import React, { FC, memo, useEffect, useState } from 'react';

import { Chat } from '@evo/component';
import { ChatMessageHeader } from './chat-message-header/ChatMessageHeader';
// import { SettingMessage } from '../../../components';
import s from './ChatMessage.module.scss';
import { useHomeSelector } from '../../home/home-processor/HomeProvider';

export interface IChatMessageProps {}

export const ChatMessage: FC<IChatMessageProps> = memo(({}) => {


  return (
    <div className={s.container}>
      <ChatMessageHeader />
      <div className={s.content}>
            <Chat />
      </div>
    </div>
  );
  // return (
  //   <div className={s.container}>
  //     <ChatMessageHeader />
  //     <div className={s.content}>
  //       <Splitter>
  //         <Splitter.Panel>
  //           <Chat />
  //         </Splitter.Panel>
  //       </Splitter>

  //       <Drawer
  //         title="设置"
  //         placement="right"
  //         onClose={() => collapseDrawer()}
  //         open={drawerVisible}
  //         width={400}
  //         getContainer={false}
  //         style={{ position: 'absolute' }}
  //         rootStyle={{ position: 'absolute' }}
  //       >
  //         <SettingMessage />
  //       </Drawer>
  //     </div>
  //   </div>
  // );
});
