import { ChatWindow } from '@evo/data-store';

export const initAllChatAnswers = (chatWin: ChatWindow, callback: () => any) => {
  return chatWin.ready().then(async () => {
    const messageIds = chatWin.getConfigState('messageIds');

    await Promise.all(
      messageIds.map((id) => chatWin.getMessage(id).then((msgIns) => msgIns.ready().then(callback)))
    );

    await new Promise((resolve) => {
      setTimeout(() => {
        callback();
        resolve(undefined);
      }, 20);
    });
  });
};
