import React, { useLayoutEffect, useMemo, useState } from 'react';
import { TModelAnswerCell, useChatMsgCtx, useChatWinCtx } from '@evo/data-store';

import { AnswerActions } from './components/answer-actions/AnswerActions';
import { AnswerRender } from './components/answer-render/AnswerRender';
import { MessageLayout } from '../message-layout/MessageLayout';
import { formatChatStringTime } from '../../../utils/format';
import style from './AnswerItem.modules.scss';
import { useGetState } from 'ahooks';

export interface IAnswerItemProps {
  answerId: string;
}

export const AnswerItem = React.memo<IAnswerItemProps>((props) => {
  const { answerId } = props;

  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [answerCell, setAnswerCell] = useState<TModelAnswerCell | undefined>();
  const [createdTime, setCreatedTime, getCreatedTime] = useGetState<number | undefined>();
  const [model, setModel, getModel] = useGetState(() => answerCell?.get().model);

  useLayoutEffect(() => {
    chatMsg.modelAnswers.getCellUntil({ key: answerId }).then(setAnswerCell);
  }, [chatMsg, answerId]);

  useLayoutEffect(() => {
    const subscription = answerCell?.listen(
      (signal) => {
        const nextCreatedTime = signal.next?.createdTime;
        const nextModel = signal.next?.model;

        nextCreatedTime !== getCreatedTime() && setCreatedTime(nextCreatedTime);
        nextModel !== getModel() && setModel(nextModel);
      },
      { immediate: true }
    );

    return subscription?.unsubscribe;
  }, [answerCell]);

  const formatCreatedTime = useMemo(() => formatChatStringTime(createdTime), [createdTime]);

  if (!answerCell) return null;

  return (
    <MessageLayout
      className={style.container}
      name={model}
      time={formatCreatedTime}
      actionArea={<AnswerActions answerCell={answerCell} />}
    >
      <AnswerRender answerCell={answerCell} />
    </MessageLayout>
  );
});
