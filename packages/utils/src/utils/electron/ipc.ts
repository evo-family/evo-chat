export const IPC_EVENTS = {
  // 应用更新相关
  UPDATE: {
    CHECK: 'check-for-updates',
    AVAILABLE: 'update-available',
    NOT_AVAILABLE: 'update-not-available', //没有可用更新
    ERROR: 'update-error',
    PROGRESS: 'update-progress',
    DOWNLOADED: 'update-downloaded',
    CANCEL: 'update-cancel',
    GET_VERSION: 'get-version',
  },

  // 窗口操作相关
  WINDOW: {
    MINIMIZE: 'window-minimize',
    MAXIMIZE: 'window-maximize',
    CLOSE: 'window-close',
    FOCUS: 'window-focus',
  },

  // 系统操作相关
  SYSTEM: {
    OPEN_EXTERNAL: 'open-external-link',
    SHOW_ITEM_IN_FOLDER: 'show-item-in-folder',
    GET_PATH: 'get-system-path',
  },

  // 对话框相关
  DIALOG: {
    OPEN_FILE: 'dialog-open-file',
    SAVE_FILE: 'dialog-save-file',
    MESSAGE_BOX: 'dialog-message-box',
  },
} as const;

// 类型导出
export type IpcEvents = typeof IPC_EVENTS;
export type UpdateEvents = IpcEvents['UPDATE'];
export type WindowEvents = IpcEvents['WINDOW'];
export type SystemEvents = IpcEvents['SYSTEM'];
export type DialogEvents = IpcEvents['DIALOG'];