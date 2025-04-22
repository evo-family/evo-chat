import {
  BaseService,
  StateTissue,
  persistenceCell,
  persistenceCellSync,
  persistenceTissue,
  persistenceTissueSync,
} from '@evo/utils';
import { CURRENT_WIN_ID, WINDOW_INFO_RECORDS, WINDOW_LAYOUT } from './constants';
import {
  IChatControllerInitOptions,
  IChatControllerOptions,
  IChatCtrlWindowRecord,
  TInitialWindowConfig,
} from './types';

import { ChatWindow } from '../chat-window/chatWindow';
import { IChatWindowSelfOptions } from '../chat-window/types';
import { genWinId } from './utils/common';

export class ChatController<Context = any> extends BaseService<IChatControllerOptions<Context>> {
  windowStore = new StateTissue<Record<string, ChatWindow>>({});

  windowInfoRecords =
    persistenceTissueSync<Record<string, IChatCtrlWindowRecord>>(WINDOW_INFO_RECORDS);

  windowLayout = persistenceCellSync<string[]>(WINDOW_LAYOUT, []);
  curWinId = persistenceCellSync<string>(CURRENT_WIN_ID);

  constructor(options: IChatControllerInitOptions<Context>) {
    super(options);

    this.init();
  }

  protected initWindowInstance(config: IChatWindowSelfOptions['config']) {
    const winId = config.id;
    const targetChatWin = this.windowStore.getCellValueSync(winId);

    if (targetChatWin) {
      return targetChatWin;
    }

    const chatWindow = new ChatWindow({
      config,
    });

    this.windowStore.setCellValueSync(winId, chatWindow);

    // 建立与windowStore的双向同步，windowStore删除该key，windowInstance也会执行destory。
    // windowInstance销毁时，windowStore也会执行clearCell
    chatWindow.registerHook('destroy', () => {
      this.windowStore.clearCell(winId);

      // chatWindow实例销毁时，要同时清空windowInfoRecords和layout的记录。
      this.windowLayout.set(this.windowLayout.get().filter((id) => winId !== id));
      this.windowInfoRecords.clearCell(winId);

      // 如果删除的正好是当前正选中的window实例，重置curWindow为layout的第一个
      if (winId === this.curWinId.get()) {
        this.curWinId.set(this.windowLayout.get().at(0) ?? '');
      }
    });
    this.windowStore.listen(
      (signal) => {
        if (signal.cellInfo?.action === 'destroy') {
          chatWindow.destroy();
        }
      },
      { keys: [config.id], receiveDestroySignal: true }
    );

    return chatWindow;
  }

  protected async init() {
    try {
      this.registerHook('prepare', async () => {
        await Promise.all([
          persistenceTissue(WINDOW_INFO_RECORDS),
          persistenceCell(WINDOW_LAYOUT),
          persistenceCell(CURRENT_WIN_ID),
        ]);

        const layout = this.windowLayout.get();
        const records = this.windowInfoRecords.getCellsValue({ all: true });

        // 剔除与本地不符的window记录（过期或者错误问题）
        records.map.forEach(
          (info, key) => layout.includes(key) || this.windowInfoRecords.clearCell(key)
        );
        this.windowLayout.set(layout.filter((id) => this.windowInfoRecords.isCellExist(id)));
      });

      await this.asyncExecute('prepare');

      // 初始windowInfoRecords对应的chatWindow实例
      this.windowInfoRecords
        .getCellsValue({ all: true })
        .map.forEach((info, key) => this.initWindowInstance({ id: key, ...info }));

      // 建立持续同步windowInfoRecords与windowStore的同步
      this.connectInfoToWindow();
      this.initCurWinId();

      this.deferredInitTask?.resolve(undefined);
    } catch (error) {
      console.error(error);
    }
  }

  protected connectInfoToWindow() {
    const subscription = this.windowInfoRecords.globListen((signal) => {
      const windowId = signal.key;

      if (!windowId) return;

      const { cellInfo } = signal;

      if (cellInfo.action === 'init') {
        const { initialConfig } = cellInfo.next;

        this.initWindowInstance({
          id: windowId,
          ...initialConfig,
        });
      }
    }, {});

    this.destroyCleanups.push(subscription.unsubscribe);
  }

  protected initCurWinId() {
    const curWinId = this.curWinId.get();
    const windLayout = this.windowLayout.get();
    const isCurWinExist = windLayout.some((id) => id === curWinId);

    if (!isCurWinExist) {
      // 默认取layout的第一个作为选中的chatWindow
      const firstWinId = this.windowLayout.get().at(0);

      if (firstWinId) {
        this.curWinId.set(firstWinId);
      } else {
        this.createWindow();
      }
    }
  }

  getWindow(id: string) {
    return this.windowStore.getCellValueUntil(id);
  }

  getWindowList() {
    return Promise.all(this.windowLayout.get().map((id) => this.getWindow(id)));
  }

  async createWindow(initialConfig?: TInitialWindowConfig) {
    const newWindowId = genWinId();

    const storeRecord: IChatCtrlWindowRecord = { initialConfig };

    this.windowLayout.set([newWindowId, ...this.windowLayout.get()]);
    this.windowInfoRecords.setCellValueSync(newWindowId, storeRecord);

    const chatWindow = await this.windowStore.getCellValueUntil(newWindowId);

    this.curWinId.set(newWindowId);

    return chatWindow;
  }

  removeWindow(key: string) {
    this.windowStore.clearCell(key);
  }

  setCurrentWin(key: string) {
    this.curWinId.set(key);
  }

  getCurWindow() {
    const curId = this.curWinId.get();
    return curId ? this.getWindow(curId) : undefined;
  }

  // connectChatWin(winIns: ChatWindow) {
  //   const id = winIns.getConfigState().id;
  //   const storeRecord: IChatCtrlWindowRecord = {};

  //   this.windowStore.setCellValueSync(id, winIns);
  //   this.windowLayout.set([...this.windowLayout.get(), id]);
  //   this.windowInfoRecords.setCellValueSync(id, storeRecord);
  // }
}
