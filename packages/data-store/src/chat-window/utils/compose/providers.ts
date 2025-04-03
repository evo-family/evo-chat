import { ChatWindow } from '@/chat-window/chatWindow';
import { IMessageConfig } from '@/chat-message/types';

export const composeProviders = (chatWin: ChatWindow): IMessageConfig['providers'] => {
  const providers: IMessageConfig['providers'] = [];

  const models = chatWin.getConfigState().models;

  for (const provider of models) {
    for (const model of provider.models) {
      providers.push({
        name: provider.id,
        model: model.id,
      });
    }
  }

  return providers;
};
