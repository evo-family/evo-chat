import {
  EModalConnStatus,
  useChatAnswerCtx,
  useChatAnswerOrgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import React, { useLayoutEffect, useMemo } from 'react';
import { cxb, useCellValueSelector } from '@evo/utils';

import { AnswerContentRender } from '../answer-content-render/AnswerContentRender';
import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import { Divider } from 'antd';
import { McpExecuteInfo } from '../mcp-execute-info/McpExecuteInfo';
import { ReasoningRender } from '../reasoning-render/ReasoningRender';
import Style from './Style.module.scss';
import { useDebounceEffect } from 'ahooks';

const cx = cxb.bind(Style);

export interface AnswerRenderTurnItemProps {
  turnIndex: number;
}

export const AnswerTurnItem = React.memo<AnswerRenderTurnItemProps>((props) => {
  const { turnIndex } = props;

  const [tryScrollToBtmIfNeed] = useChatWinCtx((ctx) => ctx.tryScrollToBtmIfNeed);
  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);
  const [status] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.status);
  const [reasoning_content] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.reasoning_content
  );
  const [content] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.content);

  useDebounceEffect(
    () => {
      tryScrollToBtmIfNeed();
    },
    [content, reasoning_content, status],
    { wait: 20 }
  );

  if (status === EModalConnStatus.PENDING) {
    return (
      <BubbleChat
        contents={[
          {
            key: 3,
            role: 'user',
            className: cx('loading'),
            loading: true,
          },
        ]}
      />
    );
  }

  return (
    <>
      <ReasoningRender turnIndex={turnIndex} />
      <McpExecuteInfo turnIndex={turnIndex} />
      <AnswerContentRender turnIndex={turnIndex} />
    </>
  );
});

export interface IAnswerRenderProps {}

export const AnswerRender = React.memo<IAnswerRenderProps>((props) => {
  const [chatTurns] = useChatAnswerCtx((ctx) => ctx.chatTurnsCell);
  const maxIndex = chatTurns.length - 1;

  return chatTurns.map((turnItem, index) => {
    return (
      <div key={index}>
        <AnswerTurnItem turnIndex={index} />
        {index !== maxIndex ? <Divider style={{ margin: '10px 0' }} /> : null}
      </div>
    );
  });
});
