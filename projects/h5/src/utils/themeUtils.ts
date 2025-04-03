import { EThemeMode } from "@evo/types";

export const setH5Theme = (theme: EThemeMode) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-prefers-color-scheme', 'dark');
      root.style.setProperty('--adm-color-background', '#000');
      root.style.setProperty('--adm-color-text', '#fff');
      root.style.setProperty('--adm-color-text-secondary', 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--adm-border-color', '#333');
      root.style.setProperty('--adm-color-fill-content', '#1a1a1a');
    } else if (theme === 'light') {
      root.setAttribute('data-prefers-color-scheme', 'light');
      root.style.setProperty('--adm-color-background', '#fff');
      root.style.setProperty('--adm-color-text', '#333');
      root.style.setProperty('--adm-color-text-secondary', '#666');
      root.style.setProperty('--adm-border-color', '#eee');
      root.style.setProperty('--adm-color-fill-content', '#f5f5f5');
    } else {
      // 跟随系统
      root.removeAttribute('data-prefers-color-scheme');
      root.style.removeProperty('--adm-color-background');
      root.style.removeProperty('--adm-color-text');
      root.style.removeProperty('--adm-color-text-secondary');
      root.style.removeProperty('--adm-border-color');
      root.style.removeProperty('--adm-color-fill-content');
    }
}