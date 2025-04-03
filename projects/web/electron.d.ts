import { ElectronAPI } from '@evo/types';

declare global {
  interface Window {
    __ELECTRON__: ElectronAPI;
  }
}
