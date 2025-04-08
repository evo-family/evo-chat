import React, { useLayoutEffect, useMemo, useState } from 'react';
import { TModelAnswerCell, useChatMsgCtx } from '@evo/data-store';

import { AnswerActions } from './components/answer-actions/AnswerActions';
import { AnswerRender } from './components/answer-render/AnswerRender';
import { MessageLayout } from '../message-layout/MessageLayout';
import { ModelAvatar } from '../../../avatar/model/ModelAvatar';
import { formatChatStringTime } from '../../../utils/format';
import style from './AnswerItem.modules.scss';
import { useCellValueSelector } from '@evo/utils';
import { useGetState } from 'ahooks';

export interface IAnswerItemProps {
  answerId: string;
}

export const AnswerItem = React.memo<IAnswerItemProps>((props) => {
  const { answerId } = props;

  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);

  const [answerCell, setAnswerCell] = useState<TModelAnswerCell | undefined>();

  const [createdTime] = useCellValueSelector(answerCell, (value) => value?.createdTime);
  const [model] = useCellValueSelector(answerCell, (value) => value?.model);

  useLayoutEffect(() => {
    chatMsg.modelAnswers.getCellUntil({ key: answerId }).then(setAnswerCell);
  }, [chatMsg, answerId]);

  const formatCreatedTime = useMemo(() => formatChatStringTime(createdTime), [createdTime]);

  if (!answerCell) return null;

  return (
    <MessageLayout
      className={style.container}
      avatar={<ModelAvatar modelName={model} />}
      name={model}
      time={formatCreatedTime}
      actionArea={<AnswerActions answerCell={answerCell} />}
    >
      <AnswerRender answerCell={answerCell} />
    </MessageLayout>
  );
});
