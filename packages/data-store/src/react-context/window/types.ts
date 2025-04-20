import { ChatMessage } from '@/chat-message/chatMessage';
import { ChatWindow } from '@/chat-window/chatWindow';
import { DataCell } from '@evo/utils';
import { IFileMeta } from '@evo/types';
import { Virtualizer } from '@tanstack/react-virtual';

export interface IChatMessageListFeautres {
  answerMaximizable?: boolean;
}

export interface IChatWinFeatures {
  messageList?: IChatMessageListFeautres;
}

export interface IChatWindowContextOptions {
  features?: IChatWinFeatures;
}

export interface IChatWindowContext {
  options: DataCell<IChatWindowContextOptions>;
  chatWin: DataCell<ChatWindow>;
  autoScroll: DataCell<boolean>;
  latestMsg: DataCell<ChatMessage | undefined>;
  virtualizerCell: DataCell<undefined | Virtualizer<HTMLDivElement, Element>>;
  tryScrollToBtmIfNeed: () => any;
  scrollToBottom: () => any;
  scrollList: (params: { direction: 'top' | 'bottom'; distance: number }) => any;
  onListScroll: (event: any) => any;
  handlePostMessage: (text: string, params: { fileInfos: IFileMeta[] }) => any;
}
