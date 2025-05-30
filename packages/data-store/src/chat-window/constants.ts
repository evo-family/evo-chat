import { EMCPExecuteMode } from '@evo/types';
import { IChatWindowSelfOptions } from './types';

export const DEFAULT_WINDOW_CONFIG: IChatWindowSelfOptions = {
  config: {
    id: '',
    models: [],
    knowledgeIds: [],
    messageIds: [],
    createdTime: +new Date(),
    mcpExecuteMode: EMCPExecuteMode.COMPATIBLE,
  },
};
