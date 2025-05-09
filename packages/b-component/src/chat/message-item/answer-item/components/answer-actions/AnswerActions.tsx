import { ArrowsAltOutlined, XFilled } from '@ant-design/icons';
import {
  EModalAnswerStatus,
  TModelAnswerCell,
  useChatMsgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import React, { MouseEvent, useMemo } from 'react';

import { FlexFillWidth } from '../../../../../flexable/flex-fill-width/FlexFillWidth';
import { Tooltip } from 'antd';
import style from './Style.module.scss';
import { useCellValueSelector } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IAnswerActionsProps {
  answerCell: TModelAnswerCell;
  showMaximize?: boolean;
  onExpandClick?: (event: MouseEvent) => any;
}

export const AnswerActions = React.memo<IAnswerActionsProps>((props) => {
  const { answerCell, showMaximize, onExpandClick } = props;

  const [chatWinOptions] = useChatWinCtx((ctx) => ctx.options);
  const [chatMsg] = useChatMsgCtx((ctx) => ctx.chatMsg);
  const [status] = useCellValueSelector(answerCell, (value) => value.status);

  const stopModel = useMemoizedFn(() => {
    chatMsg.stopResolveAnswer(answerCell.get().id);
  });

  const showStopButton = useMemo(
    () => status === EModalAnswerStatus.PENDING || status === EModalAnswerStatus.RECEIVING,
    [status]
  );

  const answerMaximizable = useMemo(() => {
    return chatWinOptions?.features?.messageList?.answerMaximizable;
  }, [chatWinOptions?.features?.messageList?.answerMaximizable]);

  return (
    <FlexFillWidth className={style['answer-actions']}>
      <div>
        {showStopButton && (
          <Tooltip title="停止内容生成">
            <XFilled className={style['stop-icon']} onClick={stopModel} />
          </Tooltip>
        )}
      </div>
      <div>
        {answerMaximizable ? (
          <Tooltip title={showMaximize ? '最小化' : '最大化'}>
            <ArrowsAltOutlined className={style['expand-icon']} onClick={onExpandClick} />
          </Tooltip>
        ) : null}
      </div>
    </FlexFillWidth>
  );
});
