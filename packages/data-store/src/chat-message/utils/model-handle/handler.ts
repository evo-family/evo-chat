import { AuthenticationError } from 'openai';
import { EModalAnswerStatus } from '@/chat-message/types';
import { IModelConnHandle } from './types';
import { OpenAiClient } from '@evo/utils';
import { defaultStreamResolver } from './stream';
import { getEmptyModelConnResult } from '@/chat-message/constants/answer';
import { modelProcessor } from '../../../processor';

export const modelConnHandle: IModelConnHandle = (params) => {
  const { answerConfig, getMessageContext, taskSignal, onResolve } = params;
  const providerName = answerConfig.provider;

  // 根据供应商获取对应的连接
  const provider = modelProcessor.availableModels?.get().find((f) => f.id == providerName);
  if (!provider) {
    throw new Error('provider is empty');
  }

  const modelConnection = new OpenAiClient({
    apiKey: provider?.apiInfo.key!,
    baseURL: provider?.apiInfo.url!,
    defaultModel: answerConfig.model,
  });

  const baseConnResult = getEmptyModelConnResult();
  const modelParams = modelProcessor.modelParams.get();

  return getMessageContext().then((composeMessages) => {
    return modelConnection
      .chat(composeMessages, {
        stream: true,
        model: answerConfig.model,
        ...modelParams,
      })
      .then((modelConnResult) => {
        taskSignal.promise.finally(() => modelConnResult.controller.abort());

        return defaultStreamResolver({
          stream: modelConnResult,
          connResult: baseConnResult,
          onResolve,
        });
      })
      .catch((error) => {
        taskSignal.reject(error);
      });
  });
};
