import { BaseProcessor, DataCell, isElectron, isMobile } from "@evo/utils";


export class EnvProcessor extends BaseProcessor {

  isMobile: DataCell<boolean>;
  isElectron: DataCell<boolean>;
  constructor() {
    super();
    this.isMobile = new DataCell<boolean>(isMobile());
    this.isElectron = new DataCell<boolean>(isElectron());
  }

  setIsMobile = (value: boolean) => {
    this.isMobile.set(value);
  }

  setIsElectron = (value: boolean) => {
    this.isElectron.set(value);
  }

}