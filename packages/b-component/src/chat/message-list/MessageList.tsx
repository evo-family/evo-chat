import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { useChatWinCtx, useChatWinOrgCtx, useDisplayChatMessage } from '@evo/data-store';

import { MessageItem } from '../message-item/MessageItem';
import { PromptInfo } from '../prompt-info/PromptInfo';
import { ScrollToBottton } from '../scroll-button/ScrollToBottton';
import Style from './Style.module.scss';
import classNames from 'classnames';
import { initAllChatAnswers } from '../../utils/scroll';
import { useCellValue } from '@evo/utils';

export interface IMessageListProps {
  style?: React.CSSProperties;
  className?: string;
  initialScrollEnd?: boolean;
  onFirstRendered?: (cbContext: { virtualizer: Virtualizer<HTMLDivElement, Element> }) => void;
}

export const ChatMessageList = React.memo<IMessageListProps>((props) => {
  const { initialScrollEnd = true, onFirstRendered, style, className } = props;

  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [messageIds] = useCellValue(chatWin.configState.getCellSync('messageIds'));
  const virtualizerCell = useChatWinOrgCtx((ctx) => ctx.virtualizerCell);
  const { display } = useDisplayChatMessage();
  const [scrollToBottom] = useChatWinCtx((ctx) => ctx.scrollToBottom);
  const [onListScroll] = useChatWinCtx((ctx) => ctx.onListScroll);

  // 添加状态和引用来跟踪滚动位置和高度变化
  const listDOMRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: (messageIds?.length ?? 0) + 1, // 增加1个位置给提示信息
    getScrollElement: () => listDOMRef.current,
    estimateSize: () => 200, // 预估高度
    getItemKey: (index) => (index === 0 ? 'prompt-info' : messageIds?.[index - 1] ?? index),
    overscan: 3, // 预渲染数量
    gap: 20,
  });

  useEffect(() => {
    // 重置该函数，禁止虚拟列的元素高度变化时调整当前的滚动位置，要求保持原位
    virtualizer.shouldAdjustScrollPositionOnItemSizeChange = () => false;

    virtualizerCell.set(virtualizer);
  }, [virtualizer]);

  useLayoutEffect(() => {
    // 初始化所有模型输出的实例，防止异步初始化+虚拟列组合出各种对应不上的滚动问题
    initAllChatAnswers(chatWin, () => {
      if (initialScrollEnd) {
        scrollToBottom();
      }
    }).then(() => {
      onListScroll?.();
      onFirstRendered?.({ virtualizer });
    });
  }, [chatWin]);

  if (!display) return null;

  return (
    <div
      ref={listDOMRef}
      style={style}
      className={classNames(Style.message_list, className)}
      onScroll={onListScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const { key, index, start } = virtualItem;
          const msgId = messageIds?.[index - 1]; // 获取数据

          return (
            <div
              key={key}
              data-index={index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${start ?? 0}px)`,
              }}
            >
              {index === 0 ? <PromptInfo /> : <MessageItem id={msgId!} />}
            </div>
          );
        })}
      </div>
      <ScrollToBottton />
    </div>
  );
});
