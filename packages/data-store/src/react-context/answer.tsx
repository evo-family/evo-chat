import {
  EChatAnswerStatus,
  IModelAnserActionRecord,
  TModelAnswer,
  TModelAnswerCell,
} from '@/chat-message/types';
import React, { PropsWithChildren, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useGetState, useUnmount } from 'ahooks';

import { DataCell } from '@evo/utils';
import { createContext } from 'use-context-selector';
import { createUseContextSelector } from '@/utils/createContextSelector';
import { debounce } from 'lodash';
import { useChatMsgCtx } from './message';

export interface IChatAnswerContextProps {
  answerId: string;
}

export interface IChatAnswerContext {
  answerCell: TModelAnswerCell;
  chatTurnsCell: DataCell<IModelAnserActionRecord['chatTurns']>;
  curHisIndex: DataCell<number | undefined>;
}

const emptyMsgConfig: TModelAnswer = {
  id: 'test',
  model: 'test',
  provider: 'test',
  createdTime: +Date.now(),
  histroy: [],
  status: EChatAnswerStatus.END,
};
const emptyChatTurns: IModelAnserActionRecord['chatTurns'] = [];
const defaultContext: IChatAnswerContext = {
  answerCell: new DataCell(emptyMsgConfig),
  chatTurnsCell: new DataCell(emptyChatTurns),
  curHisIndex: new DataCell<undefined | number>(undefined),
};

export const ChatAnswerContext = createContext(defaultContext);

export const {
  useUnwrapCellSelector: useChatAnswerCtx,
  useProvideContextSelector: useChatAnswerOrgCtx,
} = createUseContextSelector(ChatAnswerContext);

export const ChatAnswerContextProvider = React.memo<PropsWithChildren<IChatAnswerContextProps>>(
  (props) => {
    const { answerId } = props;

    const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);
    const [answerCell, setAnswerCell] = useState<TModelAnswerCell | undefined>(() =>
      chatMsg?.modelAnswers.getCellSync(answerId)
    );
    const [chatTurnsCell] = useState(() => new DataCell<IModelAnserActionRecord['chatTurns']>([]));
    const [curHisIndex] = useGetState(
      () => new DataCell(answerCell ? answerCell.get().histroy.length - 1 : undefined)
    );

    const contextValue: IChatAnswerContext = useMemo(() => {
      return { answerCell: answerCell as any, chatTurnsCell, curHisIndex };
    }, [answerCell, chatTurnsCell, curHisIndex]);

    useLayoutEffect(() => {
      chatMsg.modelAnswers.getCellUntil({ key: answerId }).then(setAnswerCell);
    }, [chatMsg, answerId]);

    useLayoutEffect(() => {
      if (!answerCell) return;

      // 默认展示最后一条记录
      curHisIndex.set(answerCell.get().histroy.length - 1);

      const computChatTurns = () => {
        const curIndex = curHisIndex.get();
        if (curIndex === undefined) return;

        const curHis = answerCell.get().histroy.at(curIndex);
        chatTurnsCell.set(curHis ? curHis.chatTurns.slice() : []);
      };

      const subscription1 = curHisIndex.listen(computChatTurns);
      const subscription2 = answerCell.listen(computChatTurns, { immediate: true });

      return () => {
        subscription1.unsubscribe();
        subscription2.unsubscribe();
      };
    }, [curHisIndex, answerCell]);

    // 所有组件卸载时的销毁逻辑写这里
    useUnmount(() => {
      chatTurnsCell.destroy();
    });

    if (!answerCell?.get()) return;

    return (
      <ChatAnswerContext.Provider value={contextValue}>{props.children}</ChatAnswerContext.Provider>
    );
  }
);
