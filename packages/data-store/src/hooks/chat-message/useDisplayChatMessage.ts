import { useChatWinCtx } from '../../react-context/window/context';
import { useCellValue } from '@evo/utils';

export interface UseDisplayChatMessageProps {}

/**
 * 用于处理聊天消息显示的 hook
 */
export const useDisplayChatMessage = () => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const [agentIds] = useCellValue(chatWin.configState.getCellSync('agentIds'));
  const [messageIds] = useCellValue(chatWin.configState.getCellSync('messageIds'));

  return {
    display: messageIds?.length || agentIds?.length,
  };
};
