import { EModalConnStatus, useChatAnswerCtx, useChatAnswerOrgCtx } from '@evo/data-store';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import React from 'react';
import { useCellValueSelector } from '@evo/utils';

export interface IReasoningRenderProps {
  turnIndex: number;
}

export const AnswerContentRender = React.memo<IReasoningRenderProps>((props) => {
  const { turnIndex } = props;

  const chatTurnsCell = useChatAnswerOrgCtx((ctx) => ctx.chatTurnsCell);

  const [content] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.content);
  const [status] = useCellValueSelector(chatTurnsCell, (value) => value.at(turnIndex)?.status);
  const [errorMessage] = useCellValueSelector(
    chatTurnsCell,
    (value) => value.at(turnIndex)?.errorMessage
  );

  if (status === EModalConnStatus.ERROR) {
    return (
      <BubbleChat
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
    return (
      <BubbleChat
        contents={[
          {
            key: 3,
            role: 'user',
            content: content,
            loading: status === EModalConnStatus.PENDING,
          },
        ]}
      />
    );
  }
});
