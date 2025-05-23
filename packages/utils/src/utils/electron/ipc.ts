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
    ON_NATIVE_THEME_CHANGE: 'on-native-theme-change',
    GET_NATIVE_THEME: 'get-native-theme',
    GET_LOG_PATH: 'get-log-path',
    GET_TEMP_PATH: 'get-temp-path',
    OPEN_FILE: 'open-file',
    OPEN_FOLDER: 'open-folder',
    GET_VERSION: 'get-version',
    GET_OS_TYPE: 'get-os-type', // 获取当前操作系统类型

    // 暂无实现
    GET_PATH: 'get-system-path',
    CLEAN_LOCAL_DATA: 'clean-local-data',
    GET_APP_DATA_PATH: 'get-app-data-path',
    GET_USER_DATA_PATH: 'get-user-data-path',
  },

  // 对话框相关
  DIALOG: {
    OPEN_FILE: 'dialog-open-file',
    SAVE_FILE: 'dialog-save-file',
    MESSAGE_BOX: 'dialog-message-box',
  },

  // CLI 相关
  CLI: {
    CHECK_BUN_COMMAND: 'cli-check-bun-command',
    CHECK_UV_COMMAND: 'cli-check-uv-command',
    CHECK_NPX_COMMAND: 'cli-check-npx-command',
    GET_COMMAND_PATH: 'cli-get-command-path',
    INSTALL_COMMAND: 'cli-install-command',
  },

  // MCP 相关
  MCP: {
    // 分类相关
    CREATE_CATEGORY: 'mcp-create-category',
    UPDATE_CATEGORY: 'mcp-update-category',
    DELETE_CATEGORY: 'mcp-delete-category',
    GET_CATEGORY_LIST: 'mcp-get-category-list',
    GET_CATEGORY_BY_ID: 'mcp-get-category-by-id',

    // MCP 项目相关
    CREATE_MCP: 'mcp-create-mcp',
    UPDATE_MCP: 'mcp-update-mcp',
    DELETE_MCP: 'mcp-delete-mcp',
    GET_MCP_LIST: 'mcp-get-mcp-list',
    GET_MCP_BY_ID: 'mcp-get-mcp-by-id',
    GET_MCP_LIST_BY_CATEGORY: 'mcp-get-mcp-list-by-category',

    // 服务控制相关
    START_SERVICE: 'mcp-start-service',
    START_SERVICE_BY_MCP_ID: 'mcp-start-service-by-mcp-id',
    STOP_SERVICE: 'mcp-stop-service',
    GET_SERVICE_STATUS: 'mcp-get-service-status',
    GET_TOOLS: 'mcp-get-tools',
    GET_MCP_PROMPT: 'mcp-get-prompt',
    CALL_TOOL: 'mcp-call-tool',
  },

  KNOWLEDGE: {
    DELETE: 'knowledge-delete',
    DELETE_VECTOR: 'knowledge-delete-vector',
  },
} as const;

// 类型导出
export type IpcEvents = typeof IPC_EVENTS;
export type UpdateEvents = IpcEvents['UPDATE'];
export type WindowEvents = IpcEvents['WINDOW'];
export type SystemEvents = IpcEvents['SYSTEM'];
export type DialogEvents = IpcEvents['DIALOG'];
export type CliEvents = IpcEvents['CLI'];
export type McpEvents = IpcEvents['MCP'];
export type KNowledgeEvents = IpcEvents['KNOWLEDGE'];
