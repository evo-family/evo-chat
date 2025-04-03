import { generateHashId } from '@evo/utils';

export const genWinId = () => generateHashId(32, 'chat_window_');
