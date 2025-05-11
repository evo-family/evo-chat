import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import React from 'react';

export interface IReasoningRenderProps {
  answerContent?: string;
}

export const AnswerContentRender = React.memo<IReasoningRenderProps>((props) => {
  const { answerContent } = props;

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
