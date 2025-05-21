import { EModalConnStatus, useChatAnswerCtx, useChatAnswerOrgCtx } from '@evo/data-store';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import React from 'react';
import { useCellValueSelector } from '@evo/utils';

export interface IReasoningRenderProps {
  turnIndex: number;
  style?: React.CSSProperties;
  className?: string;
}

export const AnswerContentRender = React.memo<IReasoningRenderProps>((props) => {
  const { turnIndex, style, className } = props;

  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);

  const [content] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.content);
  const [status] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.status);
  const [errorMessage] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.errorMessage
  );

  if (status === EModalConnStatus.ERROR) {
    if (!errorMessage?.trim().length) {
      return null;
    }

    return (
      <BubbleChat
        style={style}
        className={className}
        contents={[
          {
            key: 3,
            role: 'error',
            content: errorMessage,
          },
        ]}
      />
    );
  } else {
    if (!content?.trim().length) {
      return null;
    }

    return (
      <BubbleChat
        style={style}
        className={className}
        contents={[
          {
            key: 3,
            role: 'user',
            content: content,
          },
        ]}
      />
    );
  }
});
