import { ELanguage } from '@evo/types';

/**
 * 主题颜色数据
 */
export const themeColorData = [
  { value: 'default', color: '#ecedee', label: '默认', darkColor: '#2c2c2c' },
  // { id: 'secondary', color: 'var(--color-fill-secondary', label: '默认', darkColor: '#1a1a1a' },
  // { id: 'purple', color: 'rgba(114, 42, 255, 1)', label: '默认', darkColor: '#3a3a3a' },
  { value: 'sky', color: '#e8f1f4', label: '晴空', darkColor: '#1e2a3a' },
  { value: 'obsidian', color: '#59657d', label: '曜石', darkColor: '#1a1a1a' },
  { value: 'firmament', color: '#dee5ff', label: '苍穹', darkColor: '#2a2a4a' },
];

/**
 * 主题颜色数据
 */
export const languageData = [
  { value: ELanguage.AUTO, label: '自动' },
  { value: ELanguage.ZH_CN, label: '简体中文' },
  { value: ELanguage.EN_US, label: 'English' },
];
