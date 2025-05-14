import {
  EModalConnStatus,
  useChatAnswerCtx,
  useChatAnswerOrgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import React, { useLayoutEffect, useMemo } from 'react';

import { AnswerContentRender } from '../answer-content-render/AnswerContentRender';
import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import { Divider } from 'antd';
import { McpExecuteInfo } from '../mcp-execute-info/McpExecuteInfo';
import { ReasoningRender } from '../reasoning-render/ReasoningRender';
import { useCellValueSelector } from '@evo/utils';
import { useUpdateEffect } from 'ahooks';

export interface AnswerRenderTurnItemProps {
  turnIndex: number;
}

export const AnswerTurnItem = React.memo<AnswerRenderTurnItemProps>((props) => {
  const { turnIndex } = props;

  const [tryScrollToBtmIfNeed] = useChatWinCtx((ctx) => ctx.tryScrollToBtmIfNeed);
  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);
  const [status] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.status);
  const [errorMessage] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.errorMessage
  );
  const [reasoning_content] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.reasoning_content
  );
  const [content] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.content);

  useUpdateEffect(() => {
    tryScrollToBtmIfNeed();
  }, [content, reasoning_content, status]);

  if (status === EModalConnStatus.PENDING) {
    return (
      <BubbleChat
        contents={[
          {
            key: 2,
            role: 'user',
            loading: true,
          },
        ]}
      />
    );
  }

  return (
    <>
      {status === EModalConnStatus.ERROR ? (
        <BubbleChat
          contents={[
            {
              key: 2,
              role: 'error',
              content: errorMessage,
            },
          ]}
        />
      ) : (
        <>
          <ReasoningRender turnIndex={turnIndex} />
          <McpExecuteInfo turnIndex={turnIndex} />
          <AnswerContentRender answerContent={content} />
        </>
      )}
    </>
  );
});

export interface IAnswerRenderProps {}

export const AnswerRender = React.memo<IAnswerRenderProps>((props) => {
  const [chatTurns] = useChatAnswerCtx((ctx) => ctx.chatTurnsCell);

  return chatTurns.map((turnItem, index) => {
    return (
      <div key={index}>
        <AnswerTurnItem turnIndex={index} />
        <Divider style={{ margin: '10px 0' }} />
      </div>
    );
  });
});
