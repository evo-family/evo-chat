import { AuthenticationError } from 'openai';
import { EModalConnStatus } from '@/chat-message/types';
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
    mcpToolsOptions,
    mcpExecuteMode,
    onResolve,
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
  const baseConnResult = getEmptyModelConnResult({ userContent, mcpExecuteMode });

  actionRecord.chatTurns.push(baseConnResult);
  onResolve?.(baseConnResult);

  return getMessageContext().then(({ composeMessages, chatOptions }) => {
    return modelConnection
      .chat(composeMessages, {
        stream: true,
        model: answerConfig.model,
        ...modelParams,
        ...chatOptions,
      })
      .then((modelConnResult) => {
        taskSignal.promise.finally(() => modelConnResult.controller.abort());

        return defaultStreamResolver({
          stream: modelConnResult,
          connResult: baseConnResult,
          mcpToolsOptions,
          mcpExecuteMode,
          onResolve,
        });
      })
      .then((connResult) => {
        baseConnResult.status = EModalConnStatus.SUCCESS;
        onResolve?.(connResult);

        return connResult;
      });
  });
};
