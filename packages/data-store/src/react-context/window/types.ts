import { ChatWindow } from '@/chat-window/chatWindow';
import { IFileMeta } from '@evo/types';
import { DataCell } from '@evo/utils';
import { RefObject } from 'react';

export interface IChatWindowContext {
  chatWin: DataCell<ChatWindow>;
  autoScroll: DataCell<boolean>;
  listDOMRef: RefObject<HTMLDivElement>;
  onMsgListScroll: () => any;
  tryScrollToBtmIfNeed: () => any;
  scrollToBottom: () => any;
  handlePostMessage: (text: string, params: { fileInfos: IFileMeta[] }) => any;
}
