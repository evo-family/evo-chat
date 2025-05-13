import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { useChatWinCtx, useChatWinOrgCtx, useDisplayChatMessage } from '@evo/data-store';

import { MessageItem } from '../message-item/MessageItem';
import { ScrollToBottton } from '../scroll-button/ScrollToBottton';
import Style from './Style.module.scss';
import { initAllChatAnswers } from '../../utils/scroll';
import { useCellValue } from '@evo/utils';
import { PromptInfo } from '../prompt-info/PromptInfo';
import classNames from 'classnames';

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

  const listDOMRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messageIds?.length ?? 0,
    getScrollElement: () => listDOMRef.current,
    estimateSize: () => 200, // 预估高度
    getItemKey: (index) => messageIds?.[index] ?? index, // 使用消息ID作为缓存key
    overscan: 3, // 预渲染数量
    gap: 20,
  });

  useEffect(() => {
    virtualizerCell.set(virtualizer);
  }, [virtualizer]);

  useLayoutEffect(() => {
    // 初始化所有模型输出的实例，防止异步初始化+虚拟列组合出各种对应不上的滚动问题
    initAllChatAnswers(chatWin, () => {
      if (initialScrollEnd) {
        scrollToBottom();
      }
    }).then(() => {
      onFirstRendered?.({ virtualizer });
    });
  }, [chatWin]);

  if (!display) return null;

  return (
    <>
      <div
        ref={listDOMRef}
        style={style}
        className={classNames(Style.message_list, className)}
        onScroll={onListScroll}
      >
        <PromptInfo />
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const { key, index, start } = virtualItem;
            const msgId = messageIds?.[index]; // 获取数据

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
                <MessageItem id={msgId!} />
              </div>
            );
          })}
        </div>
        <ScrollToBottton />
      </div>
    </>
  );
});
