import { AuthenticationError } from 'openai';
import { EModalAnswerStatus } from '@/chat-message/types';
import { IModelConnHandle } from './types';
import { OpenAiClient } from '@evo/utils';
import { defaultStreamResolver } from './stream';
import { getEmptyModelConnResult } from '@/chat-message/constants/answer';
import { modelProcessor } from '../../../processor';

export const modelConnHandle: IModelConnHandle = (params) => {
  const {
    answerConfig,
    getMessageContext,
    taskSignal,
    userContent,
    actionRecord,
    onResolve,
    firstResolve,
  } = params;
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
  const modelParams = modelProcessor.modelParams.get();
  const baseConnResult = getEmptyModelConnResult(userContent);

  actionRecord.chatTurns.push(baseConnResult);

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
          firstResolve,
        });
      })
      .then((connResult) => {
        baseConnResult.status = EModalAnswerStatus.SUCCESS;
        onResolve?.(connResult);

        return connResult;
      })
      .catch((error) => {
        taskSignal.reject(error);

        let errorMessage = error?.message ?? error?.toString() ?? '';

        if (error instanceof AuthenticationError) {
          errorMessage = 'API秘钥或令牌无效';
        }

        baseConnResult.status = EModalAnswerStatus.ERROR;

        onResolve?.(baseConnResult);

        return Promise.reject(error);
      });
  });
};
