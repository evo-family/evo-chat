import { useChatWinCtx } from '@evo/data-store';
import { useEffect, useState } from 'react';

/**
 * 用于管理聊天窗口标题的自定义Hook
 * @returns {string} 当前聊天标题
 */
export const useTitle = () => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [chatTitle, setChatTitle] = useState<string>('');

  useEffect(() => {
    const subscriber = chatWin.title.listen(
      (notice) => {
        if (!notice.next) return;
        setChatTitle(notice.next);
      },
      { immediate: true }
    );

    return () => subscriber.unsubscribe();
  }, []);

  return chatTitle;
};
