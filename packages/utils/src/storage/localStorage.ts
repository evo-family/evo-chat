export class LocalStorage {
  private prefix: string;

  constructor(prefix: string = 'evo_chat') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      const fullKey = this.getKey(key);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(fullKey, serializedValue);
    } catch (error) {
      console.error('LocalStorage 存储失败:', error);
    }
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.getKey(key);
      const value = localStorage.getItem(fullKey);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('LocalStorage 读取失败:', error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    const fullKey = this.getKey(key);
    localStorage.removeItem(fullKey);
  }

  clear(includePrefix: boolean = true): void {
    if (includePrefix) {
      // 只清除指定前缀的数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // 清除所有数据
      localStorage.clear();
    }
  }

  has(key: string): boolean {
    const fullKey = this.getKey(key);
    return localStorage.getItem(fullKey) !== null;
  }
}

// 导出默认实例
export const storage = new LocalStorage();
