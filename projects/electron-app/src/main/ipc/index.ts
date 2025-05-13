import { setupFileHandlers } from './fileHandlers';
import { setupAutoUpdataHandler } from './updateHandlers';
import { setupCliHandlers } from './cliHandlers';
import { setupMcpHandlers } from './mcpHandlers';
import { setupSystemsHandlers } from './systemHandlers';
import { setupKnowledgeHandlers } from './knowledgeHandlers';

export const ipcInit = async () => {
  await Promise.all([
    setupFileHandlers(),
    setupKnowledgeHandlers(),
    setupAutoUpdataHandler(),
    setupCliHandlers(),
    setupMcpHandlers(),
    setupSystemsHandlers(),
  ]);
};
