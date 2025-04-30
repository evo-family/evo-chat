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
  TModelAnswer,
} from './types';
import { map, of } from 'rxjs';

import { AuthenticationError } from 'openai';
import { IComposeModelContextParams } from './utils/model-handle/types';
import { composeModelConnContext } from './utils/model-handle/modelConnContext';
import { fixChatMsg20250430 } from '@/utils/upgrade_scripts/chatMessage/20250430';
import { getEmptyAnswerData } from './constants/answer';
import { modelConnHandle } from './utils/model-handle/handler';

export class ChatMessage<Context = any> extends BaseService<IChatMessageOptions<Context>> {
  configState: DataCell<IMessageConfig>;
  modelAnswers = new StateTissue<Record<string, TModelAnswer>>({});
  answerResolver: Map<string, PromiseWrap> = new Map();

  constructor(options: IChatMessageInitOptions<Context>) {
    super(options);

    this.configState = persistenceCellSync<IMessageConfig>(options.id, {
      id: options.id,
      sendMessage: '',
      createdTime: +Date.now(),
      providers: [],
      answerIds: [],
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
              if (
                answerData.connResult.status === EModalAnswerStatus.PENDING ||
                answerData.connResult.status === EModalAnswerStatus.RECEIVING
              ) {
                answerData.connResult.status = EModalAnswerStatus.SUCCESS;
                cell.set(answerData);
              }

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

  async initializeAnswer(id: string, params?: IComposeModelContextParams) {
    const answerCell = this.modelAnswers.getCellSync(id);

    if (!answerCell) return;

    const answerData = answerCell.get();
    const msgConfig = this.getConfigState();

    // 先尝试停止前一个model连接接收
    this.stopResolveAnswer(answerData.id);

    const resolver = this.getModelConnSignal(answerData.id);

    try {
      // 重置数据answer的数据
      answerCell.set({
        ...answerData,
        ...getEmptyAnswerData(),
      });

      resolver.promise
        .then(() => {
          const curData = answerCell.get();
          curData.connResult.status = EModalAnswerStatus.SUCCESS;
          answerCell.set(curData);
        })
        .catch((error: any) => {
          const curData = answerCell.get();
          let errorMessage = error?.message ?? error?.toString() ?? '';

          if (error instanceof AuthenticationError) {
            errorMessage = 'API秘钥或令牌无效';
          }

          curData.connResult.errorMessage = errorMessage;
          curData.connResult.status = EModalAnswerStatus.ERROR;

          answerCell.set(curData);
        })
        .finally(() => {
          this.stopResolveAnswer(answerData.id);
        });

      await modelConnHandle({
        msgConfig,
        taskSignal: resolver,
        answerConfig: answerData,
        onResolve: (data) => {
          const curData = answerCell.get();
          curData.connResult = data;

          answerCell.set(curData);
        },
        getMessageContext: () =>
          composeModelConnContext({
            msgConfig,
            ...params,
          }),
        ...params,
      });

      resolver.resolve(undefined);
    } catch (error: any) {
      resolver.reject(error);
    }
  }

  async postMessage(
    params: Pick<IMessageConfig, 'sendMessage' | 'providers' | 'attachFileInfos'> &
      IComposeModelContextParams
  ) {
    await this.ready();

    const currentConfig = this.getConfigState();

    if (currentConfig.sendMessage) {
      return Promise.reject('message already exists.');
    }

    const { providers, sendMessage, attachFileInfos, mcpIds } = params;

    const answerIds = providers.map(({ name, model }) => {
      const id = generateHashId(32, 'c_ans_');
      const msgType = mcpIds?.length ? 'mcp' : 'normal';

      const initialAnswerData: TModelAnswer = {
        id,
        model,
        provider: name,
        type: msgType,
        mcpExchanges: [],
        ...getEmptyAnswerData(),
      };
      const answerCell = persistenceCellSync<TModelAnswer>(id, initialAnswerData);

      this.modelAnswers.connectCell(id, answerCell);

      return id;
    });

    this.configState.set({
      ...currentConfig,
      sendMessage,
      providers,
      attachFileInfos,
      answerIds,
      mcpIds,
    });

    answerIds.forEach((id) => this.initializeAnswer(id, params));

    return this.modelAnswers;
  }
}
