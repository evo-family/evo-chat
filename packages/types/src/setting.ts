// 主题模式枚举
export enum EThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

// 语言枚举
export enum ELanguage {
  AUTO = 'AUTO',
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

export enum ELayout {
  l1 = 'l1',
  l2 = 'l2',
}

export interface IChatSetting {
  /**
   * 是否启用连续对话
   */
  enableContinuousDialogue: boolean;
  /**
   * 历史消息数量
   */
  historyMessageCount: number;
  /**
   * 是否显示模型信息
   */
  showModelInfo: boolean;
  /**
   * 是否显示令牌计数
   */
  showTokenCount: boolean;
}

/**
 * 关于设置
 */
export interface IAboutSetting {
  version: string;
  isAutoUpdate: boolean;
}

/**
 * 移动端权限枚举
 */
export enum MobilePermissionType {
  camera = 'camera',
  microphone = 'microphone',
  mediaLibrary = 'mediaLibrary',
}
