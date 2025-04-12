import { setupFileHandlers } from './fileHandlers';
import { setupCommonHandlers } from './commonHandlers';
import { setupAutoUpdataHandler } from './updateHandlers';
import { setupCliHandlers } from './cliHandlers';

export const ipcInit = () => {
  setupCommonHandlers();
  setupFileHandlers();
  setupAutoUpdataHandler();
  setupCliHandlers();
};
