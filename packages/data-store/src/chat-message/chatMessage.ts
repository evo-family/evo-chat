import {
  BaseService,
  DataCell,
  PromiseWrap,
  StateTissue,
  generateHashId,
  generatePromiseWrap,
  persistenceCell,
  persistenceCellSync,
} from '@evo/utils';
import {
  EChatAnswerStatus,
  EMCPExecuteStatus,
  EModalConnStatus,
  IChatMessageInitOptions,
  IChatMessageOptions,
  IMessageConfig,
  IModelAnserActionRecord,
  TModelAnswer,
  TModelAnswerCell,
} from './types';
import { IModelConnParams, TPostMessageParams } from './utils/model-handle/types';

import { AuthenticationError } from 'openai';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { composeModelConnContext } from './utils/model-handle/modelConnContext';
import { getEmptyAnswerData } from './constants/answer';
import { getMcpTools } from './utils/model-handle/mcp';
import { modelConnHandle } from './utils/model-handle/handler';

export class ChatMessage<Context = any> extends BaseService<IChatMessageOptions<Context>> {
  configState: DataCell<IMessageConfig>;
  modelAnswers = new StateTissue<Record<string, TModelAnswer>>({});
  answerResolver: Map<string, PromiseWrap> = new Map();

  constructor(options: IChatMessageInitOptions<Context>) {
    super(options);

    this.configState = persistenceCellSync<IMessageConfig>(options.id, {
      id: options.id,
      createdTime: +Date.now(),
      providers: [],
      answerIds: [],
      sendMessage: '',
      attachFileInfos: [],
      mcpIds: [],
    });

    this.init();
  }

  protected handleCleanup(): void {
    this.configState.destroy();
    this.modelAnswers.destroy();
    this.answerResolver.forEach((resolver) => resolver.reject());

    super.handleCleanup();
  }

  async init() {
    try {
      this.registerHook('prepare', async () => {
        await persistenceCell(this.options.id);

        const answerIds = this.getConfigState('answerIds');

        // 从本地取回信息
        await Promise.all(
          answerIds.map((id) =>
            persistenceCell<TModelAnswer>(id).then((cell) => {
              const answerData = cell.get();
              answerData.status = EChatAnswerStatus.END;

              // 如果本地取回的数据的状态是pending或者receiving，则将其状态改为success(未完成接收前就刷新页面强制中断了)
              answerData.histroy.forEach((record) => {
                record.chatTurns.forEach((turnItem) => {
                  if (
                    turnItem.status === EModalConnStatus.PENDING ||
                    turnItem.status === EModalConnStatus.RECEIVING
                  ) {
                    turnItem.status = EModalConnStatus.SUCCESS;
                  }
                });
              });

              cell.set(answerData);

              this.modelAnswers.connectCell(answerData.id, cell);
            })
          )
        );
      });

      await this.asyncExecute('prepare');

      this.deferredInitTask?.resolve(undefined);
    } catch (error) {
      console.error(error);
    }
  }

  getConfigState(): IMessageConfig;
  getConfigState<Key extends keyof IMessageConfig>(key?: Key): IMessageConfig[Key];
  getConfigState(key?: keyof IMessageConfig) {
    const config = this.configState.get();

    return key ? config[key] : config;
  }

  stopResolveAnswer(id: string) {
    const modelResolver = this.answerResolver.get(id);
    const answerCell = this.modelAnswers.getCellSync(id);

    if (answerCell) {
      const answerData = answerCell.get();
      answerData.status = EChatAnswerStatus.END;
      const latestTurnItem = answerData.histroy.at(-1)?.chatTurns.at(-1);

      if (latestTurnItem && latestTurnItem.status !== EModalConnStatus.ERROR) {
        latestTurnItem.status = EModalConnStatus.SUCCESS;
      }

      answerCell.set(answerData);
    }

    // 先清理前一个model连接接收
    if (modelResolver) {
      modelResolver.resolve(undefined);
      this.answerResolver.delete(id);
    }
  }

  stopResolveAllAnswer() {
    this.getConfigState('answerIds').forEach((id) => this.stopResolveAnswer(id));
  }

  removeAnswer(id: string) {
    this.modelAnswers.clearCell(id);
    this.stopResolveAnswer(id);

    const msgConfig = this.getConfigState();

    const filteredAnswerIds = msgConfig.answerIds.filter((ansId) => ansId !== id);
    this.configState.set({
      ...msgConfig,
      answerIds: filteredAnswerIds,
    });
  }

  private getModelConnSignal(id: string) {
    let resolver = this.answerResolver.get(id);

    if (!resolver) {
      resolver = generatePromiseWrap();
      this.answerResolver.set(id, resolver);
    }

    return resolver;
  }

  protected flushAnswerListen(answerCell: TModelAnswerCell) {
    const curData = answerCell.get();

    answerCell.set(curData);
  }

  async resolveModelConn(
    options: {
      answerCell: TModelAnswerCell;
    } & Pick<IModelConnParams, 'userContent' | 'actionRecord'>,
    params?: TPostMessageParams
  ) {
    const { answerCell } = options;
    const answerConfig = answerCell.get();
    const msgConfig = this.getConfigState();
    const { mcpIds } = msgConfig;
    const resolver = this.getModelConnSignal(answerConfig.id);
    const mcpToolsOptions = mcpIds ? await getMcpTools(mcpIds) : undefined;

    return await modelConnHandle({
      ...options,
      ...params,
      mcpToolsOptions,
      msgConfig,
      answerConfig,
      taskSignal: resolver,
      getMessageContext: () =>
        composeModelConnContext({
          ...params,
          mcpToolsOptions,
          msgConfig,
          answerConfig,
        }),
      onResolve: (data) => {
        this.flushAnswerListen(answerCell);
      },
    });
  }

  async initializeAnswer(id: string, params?: TPostMessageParams) {
    const answerCell = this.modelAnswers.getCellSync(id);

    if (!answerCell) return;

    // 先尝试停止前一个model连接接收
    this.stopResolveAnswer(id);

    // 重置数据answer的数据
    answerCell.set({
      ...answerCell.get(),
      ...getEmptyAnswerData(),
      status: EChatAnswerStatus.PENDING,
    });

    const answerConfig = answerCell.get();
    const msgConfig = this.getConfigState();
    const { mcpIds } = msgConfig;

    const actionRecord: IModelAnserActionRecord = {
      chatTurns: [],
    };
    answerConfig.histroy.push(actionRecord);

    const resolver = this.getModelConnSignal(answerConfig.id);
    resolver.promise.catch((error) => {
      const latestRecord = actionRecord.chatTurns.at(-1);

      if (latestRecord) {
        let errorMessage =
          error?.error?.message ?? error?.message ?? error?.error ?? error?.toString() ?? '';

        if (error instanceof AuthenticationError) {
          errorMessage = 'API秘钥或令牌无效';
        }

        latestRecord.status = EModalConnStatus.ERROR;
        latestRecord.errorMessage = errorMessage;

        this.flushAnswerListen(answerCell);
      }
    });

    try {
      resolver.promise.finally(() => {
        this.stopResolveAnswer(answerConfig.id);
      });

      const firstConnResult = await this.resolveModelConn(
        {
          answerCell,
          actionRecord,
          userContent: msgConfig.sendMessage,
        },
        params
      );

      if (mcpIds?.length) {
        let lastConnResult = firstConnResult;

        while (actionRecord.chatTurns.length < 10) {
          if (!lastConnResult.mcpInfo.executeRecords.length) {
            break;
          }

          for await (const record of lastConnResult.mcpInfo.executeRecords) {
            const executeResult = await McpBridgeFactory.getInstance().callTool(
              record.mcp_id,
              record.tool_name,
              record.arguments
            );

            if (executeResult?.success && executeResult.data) {
              if (executeResult.data.isError) {
                record.status = EMCPExecuteStatus.ERROR;
              } else {
                record.status = EMCPExecuteStatus.SUCCESS;
              }
              record.result = executeResult.data;
              this.flushAnswerListen(answerCell);
            } else {
              record.status = EMCPExecuteStatus.ERROR;

              throw executeResult;
            }
          }

          lastConnResult = await this.resolveModelConn(
            {
              answerCell,
              actionRecord,
              userContent: '',
            },
            params
          );
        }
      }

      resolver.resolve(undefined);
    } catch (error: any) {
      console.trace(error);

      resolver.reject(error);
    } finally {
      answerCell.set({
        ...answerCell.get(),
        status: EChatAnswerStatus.END,
      });
    }
  }

  async postMessage(
    params: Pick<IMessageConfig, 'sendMessage' | 'providers' | 'attachFileInfos'> &
      Omit<TPostMessageParams, 'userContent'>
  ) {
    await this.ready();

    const currentConfig = this.getConfigState();

    if (currentConfig.sendMessage) {
      return Promise.reject('Message already exist.');
    }

    const { providers, attachFileInfos, mcpIds, sendMessage } = params;

    const answerIds = providers.map(({ name, model }) => {
      const id = generateHashId(32, 'c_ans_');

      const initialAnswerData: TModelAnswer = {
        id,
        model,
        provider: name,
        ...getEmptyAnswerData(),
      };
      const answerCell = persistenceCellSync<TModelAnswer>(id, initialAnswerData);

      this.modelAnswers.connectCell(id, answerCell);

      return id;
    });

    this.configState.set({
      ...currentConfig,
      providers,
      attachFileInfos,
      answerIds,
      mcpIds,
      sendMessage,
    });

    answerIds.forEach((id) => this.initializeAnswer(id, params));

    return this.modelAnswers;
  }
}
