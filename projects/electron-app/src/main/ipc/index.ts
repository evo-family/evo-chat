import { setupFileHandlers } from './fileHandlers';
import { setupAutoUpdataHandler } from './updateHandlers';
import { setupCliHandlers } from './cliHandlers';
import { setupMcpHandlers } from './mcpHandlers';
import { setupSystemsHandlers } from './systemHandlers';

export const ipcInit = async () => {
  await Promise.all([
    setupFileHandlers(),
    setupAutoUpdataHandler(),
    setupCliHandlers(),
    setupMcpHandlers(),
    setupSystemsHandlers(),
  ]);
};
