import {
  BaseService,
  DataCell,
  StateTissue,
  generateHashId,
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
import { IBaseModelHandler, IModelConnHandleBaseParams } from './utils/model-handle/types';

import { AuthenticationError } from 'openai';
import { getEmptyAnswerData } from './constants/answer';
import { modelConnHandle } from './utils/model-handle/handler';

export class ChatMessage<Context = any> extends BaseService<IChatMessageOptions<Context>> {
  configState: DataCell<IMessageConfig>;
  modelAnswers = new StateTissue<Record<string, TModelAnswer>>({});
  answerResolver: Map<string, Awaited<ReturnType<IBaseModelHandler>>> = new Map();

  constructor(options: IChatMessageInitOptions<Context>) {
    super(options);

    this.configState = persistenceCellSync<IMessageConfig>(options.id, {
      id: options.id,
      sendMessage: '',
      createdTime: +Date.now(),
      providers: [],
      attachFileInfos: [],
      answerIds: [],
    });

    this.init();
  }

  protected handleCleanup(): void {
    this.configState.destroy();
    this.modelAnswers.destroy();
    this.answerResolver.forEach((resolver) => resolver.result.controller.abort());

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
                answerData.status === EModalAnswerStatus.PENDING ||
                answerData.status === EModalAnswerStatus.RECEIVING
              ) {
                answerData.status = EModalAnswerStatus.SUCCESS;
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
      modelResolver.result.controller.abort();
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

  async reinitializeAnswer(id: string, params?: IModelConnHandleBaseParams) {
    const answerCell = this.modelAnswers.getCellSync(id);

    if (!answerCell) return;

    const answerData = answerCell.get();
    const msgConfig = this.getConfigState();
    // 先尝试停止前一个model连接接收
    this.stopResolveAnswer(answerData.id);

    try {
      // 重置数据answer的数据
      answerCell.set({
        ...answerData,
        ...getEmptyAnswerData(),
      });

      const handleResult = await modelConnHandle({
        msgConfig,
        answerCell,
        ...params,
      });

      if (handleResult) {
        this.answerResolver.set(answerData.id, handleResult);

        await handleResult.streamTask;
      }

      answerCell.set({
        ...answerCell.get(),
        status: EModalAnswerStatus.SUCCESS,
      });
    } catch (error: any) {
      let errorMessage = error?.message ?? error?.toString() ?? '';

      if (error instanceof AuthenticationError) {
        errorMessage = 'API秘钥或令牌无效';
      }

      answerCell.set({
        ...answerCell.get(),
        status: EModalAnswerStatus.ERROR,
        errorMessage,
      });
    }
  }

  async postMessage(
    params: Pick<IMessageConfig, 'sendMessage' | 'providers' | 'attachFileInfos'> &
      IModelConnHandleBaseParams
  ) {
    await this.ready();

    const currentConfig = this.getConfigState();

    if (currentConfig.sendMessage) {
      return Promise.reject('message already exists.');
    }

    const { providers, sendMessage, attachFileInfos } = params;

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
      sendMessage,
      providers,
      attachFileInfos,
      answerIds,
    });

    answerIds.forEach((id) => this.reinitializeAnswer(id, params));

    return this.modelAnswers;
  }
}
