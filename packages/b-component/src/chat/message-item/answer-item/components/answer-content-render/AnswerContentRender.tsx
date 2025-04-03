import React, { useLayoutEffect } from 'react';
import { TModelAnswerCell, useChatWinCtx } from '@evo/data-store';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import style from './Style.modules.scss';
import { useCellValueSelector } from '@evo/utils';

export interface IReasoningRenderProps {
  answerCell: TModelAnswerCell;
}

export const AnswerContentRender = React.memo<IReasoningRenderProps>((props) => {
  const { answerCell } = props;

  const [answerContent] = useCellValueSelector(answerCell, (value) => value.content);

  if (!answerContent) return null;

  return (
    <BubbleChat
      contents={[
        {
          key: 3,
          role: 'user',
          content: answerContent,
        },
      ]}
    />
  );
});
