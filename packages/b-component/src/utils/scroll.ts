import { ChatWindow } from '@evo/data-store';

export const scrollToBottom = (containerDOM: HTMLElement | null) => {
  if (!containerDOM) return;

  containerDOM.scrollTop = containerDOM.scrollHeight;
};

export const scrollBottomWhenChatWinInit = (
  chatWin: ChatWindow,
  containerDOM: HTMLElement | null
) => {
  if (!containerDOM) return;

  const doScroll = () => scrollToBottom(containerDOM);

  chatWin.ready().then(async () => {
    const messageIds = chatWin.getConfigState('messageIds');

    await Promise.all(
      messageIds.map((id) => chatWin.getMessage(id).then((msgIns) => msgIns.ready().then(doScroll)))
    );

    setTimeout(doScroll, 20);
  });
};
