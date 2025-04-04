import { ChatMessage } from '@/chat-message/chatMessage';
import { ChatWindow } from '@/chat-window/chatWindow';
import { DataCell } from '@evo/utils';
import { IFileMeta } from '@evo/types';
import { RefObject } from 'react';

export interface IChatWindowContext {
  chatWin: DataCell<ChatWindow>;
  autoScroll: DataCell<boolean>;
  listDOMRef: RefObject<HTMLDivElement>;
  latestMsg: DataCell<ChatMessage | undefined>;
  onMsgListScroll: () => any;
  tryScrollToBtmIfNeed: () => any;
  scrollToBottom: () => any;
  handlePostMessage: (text: string, params: { fileInfos: IFileMeta[] }) => any;
}
