import {
  BaseService,
  DataCell,
  generateHashId,
  mergeExceptArray,
  persistenceTissue,
  persistenceTissueSync,
} from '@evo/utils';
import {
  IChatWindowConfig,
  IChatWindowInitOptions,
  IChatWindowOptions,
  TChatWinConfigTissue,
} from './types';

import { ChatMessage } from '../chat-message/chatMessage';
import { DEFAULT_WINDOW_CONFIG } from './constants';
import { IFileMeta } from '@evo/types';
import { StateTissue } from '@evo/utils';
import { TComposedContexts } from '@/chat-message/types';
import { composeProviders } from './utils/compose/providers';
import { modelProcessor } from '../processor';

export class ChatWindow<Context = any> extends BaseService<IChatWindowOptions<Context>> {
  configState: TChatWinConfigTissue;
  title = new DataCell<string>('');

  protected messageStore = new StateTissue<Record<string, ChatMessage>>({
    initHandler: (id) => {
      const chatMessage = new ChatMessage({ id });

      chatMessage.registerHook('destroy', () => {
        setTimeout(() => this.messageStore.clearCell(id));
      });

      return chatMessage;
    },
    hooks: {
      beforeCellDestroy: (context) => {
        context.data.cell?.get()?.destroy();

        const currentMessageIds = this.getConfigState('messageIds');

        this.setConfigState(
          'messageIds',
          currentMessageIds.filter((id) => id !== context.data.key)
        );
      },
    },
  });

  constructor(options: IChatWindowInitOptions<Context>) {
    options = mergeExceptArray(DEFAULT_WINDOW_CONFIG, options);

    super(options);

    this.configState = persistenceTissueSync<IChatWindowConfig>(options.config.id);

    this.init();
  }

  async init() {
    try {
      this.registerHook('prepare', async () => {
        await persistenceTissue(this.options.config.id);

        // 持久化tissue初始化后，再调用tryInitCell来初始化本地没有的key、value。（只针对第一次实例化该id的chatWindow时）
        Object.entries(this.options.config).forEach(([key, value]) => {
          if (key === 'createdTime') {
            value = +Date.now();
          }

          this.configState.tryInitCell(key as any, value);
        });
      });

      await this.asyncExecute('prepare');

      this.connectInfoToWindow();
      this.autoComputeTitle();

      this.deferredInitTask?.resolve(undefined);
    } catch (error) {
      console.error(error);
    }
  }

  connectInfoToWindow() {
    const subscription = this.configState.listen(
      (signal) => {
        if (!signal.key) return;

        // let newMessages: string[] = [];
        let destroyMessages: string[] = [];

        const { prev, next } = signal.cellInfo;
        const prevSet = new Set(prev);
        const nextSet = new Set(next);

        // next对比prev的差集是新增项
        // newMessages = Array.from(nextSet.difference(prevSet));
        // prev对比next的差集是删除项
        destroyMessages = Array.from(prevSet.difference(nextSet));

        for (const messageId of destroyMessages) {
          this.messageStore.clearCell(messageId);
        }
      },
      { keys: ['messageIds'] }
    );

    this.destroyCleanups.push(subscription.unsubscribe);
  }

  async autoComputeTitle() {
    // 先手动初始化manualTitle的cell，后续需要
    this.configState.tryInitCell('manualTitle', '');

    // 两套计算逻辑并存。manualTitle有值时，优先使用manualTitle，否则使用messageIds的第一个message的sendMessage作为title
    const manualTitle = await this.configState.getCell('manualTitle');
    manualTitle.listen(
      (signal) => {
        if (!signal.next) return;

        this.title.set(signal.next);
      },
      { immediate: true }
    );

    let currentMsgId = '';
    const msgIdsSubscription = this.configState.listen(
      (signal) => {
        if (manualTitle?.get()) return;

        const firstMsgId = signal.cellInfo?.next?.at(0);

        if (!firstMsgId) {
          const curTitle = this.title.get();
          curTitle && this.title.set('');
          return;
        }
        if (firstMsgId === currentMsgId) return;

        this.messageStore.getCellValue(firstMsgId).then(async (messageIns) => {
          await messageIns.ready();

          // 有一次初始化的延迟，加timeout
          setTimeout(() => this.title.set(messageIns.getConfigState('sendMessage')));
        });
      },
      { keys: ['messageIds'], immediate: true }
    );

    this.destroyCleanups.push(msgIdsSubscription.unsubscribe);
  }

  protected handleCleanup(): void {
    this.messageStore.destroy();
    this.configState.destroy();

    super.handleCleanup();
  }

  getConfigState(): IChatWindowConfig;
  getConfigState<Key extends keyof IChatWindowConfig>(key?: Key): IChatWindowConfig[Key];
  getConfigState(key?: keyof IChatWindowConfig) {
    return key
      ? this.configState.getCellValueSync(key)
      : (this.configState.getCellsValue({ all: true, getObject: true })
          .object as IChatWindowConfig);
  }

  setConfigState<Key extends keyof IChatWindowConfig>(key: Key, value: IChatWindowConfig[Key]) {
    return this.configState.setCellValueSync(key, value);
  }

  updateConfigModels(models: IChatWindowConfig['models']) {
    return this.setConfigState('models', models);
  }

  updateConfigKnowledgeIds(knowledgeIds: IChatWindowConfig['knowledgeIds']) {
    return this.setConfigState('knowledgeIds', knowledgeIds);
  }

  getMessage(id: string) {
    return this.messageStore.getCellValue(id);
  }

  async composeMessageContext(modelParams = modelProcessor.modelParams.get()) {
    const composedContexts: TComposedContexts = [];

    const messageIds = this.configState.getCellValueSync('messageIds') ?? [];
    const { context_count = 0 } = modelParams;
    const lastCountMsgIds = context_count ? messageIds.slice(-context_count) : [];
    const historyMessages = await Promise.all(
      lastCountMsgIds.map((msgId) => this.getMessage(msgId))
    );

    return { composedContexts, historyMessages, messageIds };
  }

  async createMessage(sendMessage: string, params: { fileInfos?: IFileMeta[] }) {
    await this.ready();

    const { fileInfos } = params;
    const { knowledgeIds, agentIds } = this.getConfigState();

    const newMessageId = generateHashId(32, 'c_msg_');
    const providers = composeProviders(this);

    const [messageIns, { composedContexts, historyMessages, messageIds }] = await Promise.all([
      this.messageStore.getCellValue(newMessageId),
      await this.composeMessageContext(),
    ]);

    messageIns.postMessage({
      sendMessage,
      providers,
      composedContexts,
      historyMessages,
      attachFileInfos: fileInfos ?? [],
      knowledgeIds,
      agentIds,
    });

    // 修改config是messageIds，通过listen会自动创建新的messageIns
    this.configState.setCellValueSync('messageIds', messageIds.concat(newMessageId));

    return messageIns;
  }

  async retryAnswer(params: { msgId: string; answerId: string }) {
    const { msgId, answerId } = params;

    const [messageIns, { composedContexts, historyMessages }] = await Promise.all([
      this.messageStore.getCellValue(msgId),
      await this.composeMessageContext(),
    ]);

    return messageIns.reinitializeAnswer(answerId, {
      composedContexts,
      historyMessages,
    });
  }

  async retryMessage(params: { msgId: string }) {
    const { msgId } = params;
    const chatMsg = await this.getMessage(msgId);
    const msgConfig = chatMsg.getConfigState();

    return Promise.all(
      msgConfig.answerIds.map((answerId) => this.retryAnswer({ answerId, msgId: msgConfig.id }))
    );
  }

  async stopResolveMessage(msgId: string) {
    const messageIns = await this.getMessage(msgId);
    messageIns.stopResolveAllAnswer();
  }

  async resendMessage(params: { msgId: string }) {
    const { msgId } = params;

    const messageIns = await this.messageStore.getCellValue(msgId);

    const msgConfig = messageIns.getConfigState();

    this.createMessage(msgConfig.sendMessage, {
      fileInfos: msgConfig.attachFileInfos,
    });
  }
}
