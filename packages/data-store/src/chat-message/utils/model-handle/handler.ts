import { IBaseModelHandler, IModelConnHandle } from './types';
import { IMessageConfig, TModelAnswerCell } from '../../types';

import { OpenAiClient } from '@evo/utils';
import { defaultMsgSend } from './default-handler/handle';
import { modelProcessor } from '../../../processor';

const modelHandlerMap = new Map<string, IBaseModelHandler>([]);

export const modelConnHandle: IModelConnHandle = async (params) => {
  const { answerCell } = params;
  const providerName = answerCell.get().provider;
  // 根据供应商获取对应的连接
  const provider = modelProcessor.availableModels?.get().find((f) => f.id == providerName);
  if (!provider) {
    throw new Error('provider is empty');
  }

  const matchConn = new OpenAiClient({
    apiKey: provider?.apiInfo.key!,
    baseURL: provider?.apiInfo.url!,
    defaultModel: answerCell.get().model,
  });

  const matchHandler = modelHandlerMap.get(providerName) ?? defaultMsgSend;

  return matchHandler(matchConn, params);
};
