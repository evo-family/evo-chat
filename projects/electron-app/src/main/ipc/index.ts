import { setupFileHandlers } from "./fileHandlers";
import { setupCommonHandlers } from './commonHandlers';
import { setupAutoUpdataHandler } from "./updateHandlers";

export const ipcInit = () => {
  setupCommonHandlers();
  setupFileHandlers();
  setupAutoUpdataHandler();
}
