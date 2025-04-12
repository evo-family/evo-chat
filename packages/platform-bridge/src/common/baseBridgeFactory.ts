import { isElectron, isMobileApp } from '@evo/utils';

export abstract class BaseBridgeFactory<T> {
  protected abstract createElectronBridge(): T;
  protected createMobileBridge?(): T;
  protected abstract createWebBridge(): T;

  protected createBridge(): T {
    if (isElectron()) {
      return this.createElectronBridge();
    } else if (isMobileApp()) {
      if (this.createMobileBridge) {
        return this.createMobileBridge();
      }
      return this.createWebBridge();
    } else {
      return this.createWebBridge();
    }
  }

  static getInstance<U>(this: new () => BaseBridgeFactory<U>): U {
    const instance = new this();
    return instance.createBridge();
  }
}
