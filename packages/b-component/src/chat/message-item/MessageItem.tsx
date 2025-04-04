import {
  ChatMessage,
  ChatMsgContextProvider,
  IMessageConfig,
  useChatWinCtx,
} from '@evo/data-store';
import { FileAvatar, FilePreview } from '@evo/component';
import { Flex, GetRef } from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { AnswerItem } from './answer-item/AnswerItem';
import { MessageLayout } from './message-layout//MessageLayout';
import { MessageToolbar } from './message-toolbar/MessageToolbar';
import { formatChatStringTime } from '../../utils/format';
import style from './MessageItem.module.scss';

export interface IMessageItemProps {
  id: string;
}

export const MessageItem = React.memo<IMessageItemProps>((props) => {
  const { id } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const [question, setQuestion] = useState<IMessageConfig['sendMessage']>('');
  const [createdTime, setCreatedTime] = useState<string>('');
  const [answerIds, setAnswerIds] = useState<IMessageConfig['answerIds']>([]);
  const [fileInfos, setFileInfos] = React.useState<IMessageConfig['attachFileInfos']>([]);

  useLayoutEffect(() => {
    chatWin.getMessage(id).then(async (chatMessage) => {
      if (!chatMessage) return;

      await chatMessage.ready();

      chatMessage.configState.listen(
        (signal) => {
          const value = signal.next;

          if (value) {
            setQuestion(value.sendMessage);
            setCreatedTime(formatChatStringTime(value.createdTime));
            setAnswerIds([...value.answerIds]);
            setFileInfos(value.attachFileInfos);
          }
        },
        { immediate: true }
      );
    });
  }, [id, chatWin]);

  return (
    <ChatMsgContextProvider id={id}>
      <div className={style.container}>
        <MessageLayout
          className={style.question}
          name={'just test name'}
          time={createdTime}
          actionArea={<MessageToolbar />}
        >
          <div className={style['question-content']}>{question}</div>
        </MessageLayout>
        <div>
          {fileInfos.map((info) => {
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
        </div>
        <Flex className={style['answers-wrap']}>
          {answerIds.map((ansId) => (
            <div key={ansId} className={style.flex_container}>
              <AnswerItem answerId={ansId} />
            </div>
          ))}
        </Flex>
      </div>
    </ChatMsgContextProvider>
  );
});
