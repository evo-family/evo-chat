import {
  BaseProcessor,
  DataCell,
  isElectron,
  isElectronMacOS,
  isElectronWindows,
  isElectronLinux,
  isMobile,
} from '@evo/utils';

export class EnvProcessor extends BaseProcessor {
  isMobile: DataCell<boolean>;
  isElectron: DataCell<boolean>;
  isElectronMacOS: DataCell<boolean>;
  isElectronWindows: DataCell<boolean>;
  isElectronLinux: DataCell<boolean>;

  constructor() {
    super();
    this.isMobile = new DataCell<boolean>(isMobile());
    this.isElectron = new DataCell<boolean>(isElectron());
    this.isElectronMacOS = new DataCell(false);
    this.isElectronWindows = new DataCell(false);
    this.isElectronLinux = new DataCell(false);

    isElectronMacOS().then((res) => {
      this.isElectronMacOS.set(res);
    });

    isElectronWindows().then((res) => {
      this.isElectronWindows.set(res);
    });

    isElectronLinux().then((res) => {
      this.isElectronLinux.set(res);
    });
  }

  setIsMobile = (value: boolean) => {
    this.isMobile.set(value);
  };

  setIsElectron = (value: boolean) => {
    this.isElectron.set(value);
  };
}
