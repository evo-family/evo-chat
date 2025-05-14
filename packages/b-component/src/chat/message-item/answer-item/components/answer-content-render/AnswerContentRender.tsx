import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import React, { useMemo } from 'react';

export interface IReasoningRenderProps {
  answerContent?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AnswerContentRender = React.memo<IReasoningRenderProps>((props) => {
  const { answerContent, style, className } = props;

  const rAnswerContent = useMemo(() => {
    return answerContent?.trim();
  }, [answerContent]);

  if (!rAnswerContent) return null;
  return (
    <BubbleChat
      style={style}
      className={className}
      contents={[
        {
          key: 3,
          role: 'user',
          content: rAnswerContent,
        },
      ]}
    />
  );
});
