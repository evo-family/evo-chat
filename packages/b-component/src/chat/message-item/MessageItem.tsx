import {
  ChatMessage,
  ChatMsgContextProvider,
  IMessageConfig,
  useChatMsgCtx,
  useChatMsgOrgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import { FileAvatar, FilePreview } from '@evo/component';
import { Flex, GetRef } from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { AnswerItem } from './answer-item/AnswerItem';
import { ChatAnswerContextProvider } from '../../../../data-store/src/react-context/answer';
import { CollectionLayout } from '../../collection-layout/CollectionLayout';
import { ICollectionLayoutProps } from '../../collection-layout/types';
import { MessageLayout } from './message-layout//MessageLayout';
import { MessageToolbar } from './message-toolbar/MessageToolbar';
import { formatChatStringTime } from '../../utils/format';
import style from './MessageItem.module.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

const MessageItemFileInfo = React.memo(() => {
  const msgConfigStateCell = useChatMsgOrgCtx((ctx) => ctx.chatMsg.configState);

  const [fileInfos] = useCellValueSelector(msgConfigStateCell, (state) => state.attachFileInfos);

  return (
    <>
      {fileInfos?.map((info) => {
        return (
          <Flex key={info.id}>
            <FileAvatar id={info.id} name={info.name} />
            <span
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={(e) => FilePreview.show(info)}
            >
              {info.name}
            </span>
          </Flex>
        );
      })}
    </>
  );
});

const MessageItemAnswers = React.memo(() => {
  const msgConfigStateCell = useChatMsgOrgCtx((ctx) => ctx.chatMsg.configState);

  const [answerIds] = useCellValueSelector(msgConfigStateCell, (state) => state.answerIds);

  const ItemRender = useMemoizedFn<ICollectionLayoutProps<string>['itemRender']>((id, index) => {
    return (
      <ChatAnswerContextProvider key={id} answerId={id}>
        <AnswerItem />
      </ChatAnswerContextProvider>
    );
  });

  return (
    <CollectionLayout
      data={answerIds}
      itemRender={ItemRender}
      itemClassName={style['answer-item-container']}
    />
  );
});

const MessageItemSendInfo = React.memo(() => {
  const msgConfigStateCell = useChatMsgOrgCtx((ctx) => ctx.chatMsg.configState);

  const [createdTime] = useCellValueSelector(msgConfigStateCell, (state) =>
    formatChatStringTime(state.createdTime)
  );
  const [question] = useCellValueSelector(msgConfigStateCell, (state) => state.sendMessage);

  return (
    <MessageLayout
      avatar={null}
      className={style.question}
      time={createdTime}
      actionArea={<MessageToolbar />}
    >
      <div className={style['question-content']}>{question}</div>
    </MessageLayout>
  );
});

export interface IMessageItemProps {
  id: string;
}

export const MessageItem = React.memo<IMessageItemProps>((props) => {
  const { id } = props;

  return (
    <ChatMsgContextProvider id={id}>
      <div className={style.container}>
        <div>
          <MessageItemSendInfo />
          <MessageItemFileInfo />
        </div>
        <div className={style['answers-wrap']}>
          <MessageItemAnswers />
        </div>
      </div>
    </ChatMsgContextProvider>
  );
});
