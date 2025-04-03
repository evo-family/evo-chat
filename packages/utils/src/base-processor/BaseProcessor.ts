export class BaseProcessor {
  protected constructor() { }


  public destroy() {
  }
  /**
   * 创建处理器实例
   */
  static create<T extends BaseProcessor>(this: new () => T): {
    processor: T;
    getRoot: () => T | null;
    destroy: () => void;
  } {
    let processor: T | null = new this();

    const getRoot = () => {
      return processor;
    };

    const destroy = () => {
      processor?.destroy();
      processor = null;

    };

    return {
      processor: processor as T,
      getRoot,
      destroy,
    };
  }
}
