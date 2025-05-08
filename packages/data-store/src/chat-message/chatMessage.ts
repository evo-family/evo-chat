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
  EModalAnswerStatus,
  IChatMessageInitOptions,
  IChatMessageOptions,
  IMessageConfig,
  IModelAnserActionRecord,
  IModelConnRecord,
  TModelAnswer,
  TModelAnswerCell,
} from './types';
import { IComposeModelContextParams, IModelConnParams } from './utils/model-handle/types';

import { AuthenticationError } from 'openai';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { XMLParser } from 'fast-xml-parser';
import { composeModelConnContext } from './utils/model-handle/modelConnContext';
import { getEmptyAnswerData } from './constants/answer';
import { modelConnHandle } from './utils/model-handle/handler';
import { transMcpExecuteResultToXML } from './utils/model-handle/compose-methods/mcp/msgMcp';

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

              // 如果本地取回的数据的状态是pending或者receiving，则将其状态改为success(未完成接收前就刷新页面强制中断了)
              answerData.histroy.forEach((record) => {
                record.chatTurns.forEach((turnItem) => {
                  if (
                    turnItem.status === EModalAnswerStatus.PENDING ||
                    turnItem.status === EModalAnswerStatus.RECEIVING
                  ) {
                    turnItem.status = EModalAnswerStatus.SUCCESS;
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

  async resolveModelConn(
    options: {
      answerCell: TModelAnswerCell;
    } & Pick<IModelConnParams, 'onResolve' | 'userContent' | 'actionRecord'>,
    params?: IComposeModelContextParams
  ) {
    const { answerCell, userContent, actionRecord } = options;
    const answerConfig = answerCell.get();
    const msgConfig = this.getConfigState();
    const resolver = this.getModelConnSignal(answerConfig.id);

    return await modelConnHandle({
      msgConfig,
      userContent,
      answerConfig,
      actionRecord,
      taskSignal: resolver,
      getMessageContext: () =>
        composeModelConnContext({
          msgConfig,
          answerConfig,
          ...params,
        }),
      onResolve: (data) => {
        const curData = answerCell.get();

        answerCell.set(curData);
      },

      ...params,
    });
  }

  async initializeAnswer(id: string, params?: IComposeModelContextParams) {
    const answerCell = this.modelAnswers.getCellSync(id);

    if (!answerCell) return;

    const answerConfig = answerCell.get();
    const msgConfig = this.getConfigState();
    const { mcpIds } = msgConfig;
    const actionRecord: IModelAnserActionRecord = {
      chatTurns: [],
    };
    answerConfig.histroy.push(actionRecord);

    // 先尝试停止前一个model连接接收
    this.stopResolveAnswer(answerConfig.id);

    const resolver = this.getModelConnSignal(answerConfig.id);

    try {
      // 重置数据answer的数据
      answerCell.set({
        ...answerConfig,
        ...getEmptyAnswerData(),
      });

      resolver.promise.finally(() => {
        this.stopResolveAnswer(answerConfig.id);
      });

      if (mcpIds?.length) {
        const connResult = await this.resolveModelConn(
          {
            answerCell,
            actionRecord,
            userContent: msgConfig.sendMessage,
          },
          params
        );

        console.log(1111, connResult);

        if (connResult) {
          const parser = new XMLParser({
            ignoreAttributes: false,
          });
          const mcpExecuteParams = parser.parse((connResult as IModelConnRecord).content);
          const tool_user = mcpExecuteParams?.tool_use;

          if (tool_user) {
            const validToolUser = Array.isArray(tool_user) ? tool_user : [tool_user];
            console.log(222222, { mcpExecuteParams, validToolUser });

            for await (const useToolInfo of validToolUser) {
              connResult.mcpInfo.executeParams.push({
                mcp_id: useToolInfo.mcp_id,
                name: useToolInfo.name,
                arguments: useToolInfo.arguments,
              });

              const executeResult = await McpBridgeFactory.getInstance().callTool(
                useToolInfo.mcp_id,
                useToolInfo.name,
                JSON.parse(useToolInfo.arguments)
              );

              console.log(3333, executeResult);
              if (executeResult?.success && executeResult.data) {
                connResult.mcpInfo.executeResult.push({
                  mcp_id: useToolInfo.mcp_id,
                  name: useToolInfo.name,
                  result: executeResult.data,
                });
              } else {
                throw executeResult;
              }
            }

            const XMLContent = transMcpExecuteResultToXML({
              executeResult: connResult.mcpInfo.executeResult,
            });

            const connResult2 = await this.resolveModelConn(
              {
                answerCell,
                actionRecord,
                userContent: XMLContent,
              },
              params
            );
            console.log(55555, connResult2);
          }
        }
      } else {
        await this.resolveModelConn(
          {
            answerCell,
            actionRecord,
            userContent: msgConfig.sendMessage,
          },
          params
        );
      }

      const curData = answerCell.get();
      answerCell.set(curData);

      resolver.resolve(undefined);
    } catch (error: any) {
      console.error(error);

      const curData = answerCell.get();
      let errorMessage = error?.message ?? error?.toString() ?? '';

      if (error instanceof AuthenticationError) {
        errorMessage = 'API秘钥或令牌无效';
      }

      // onnResult.status = EModalAnswerStatus.ERROR;

      answerCell.set(curData);

      resolver.reject(error);
    }
  }

  async postMessage(
    params: Pick<IMessageConfig, 'sendMessage' | 'providers' | 'attachFileInfos'> &
      Omit<IComposeModelContextParams, 'userContent'>
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
        histroy: [],
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
