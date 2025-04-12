import { setupFileHandlers } from './fileHandlers';
import { setupCommonHandlers } from './commonHandlers';
import { setupAutoUpdataHandler } from './updateHandlers';
import { setupCliHandlers } from './cliHandlers';
import { setupMcpHandlers } from './mcpHandlers';

export const ipcInit = () => {
  setupCommonHandlers();
  setupFileHandlers();
  setupAutoUpdataHandler();
  setupCliHandlers();
  setupMcpHandlers();
};
