import { isElectron } from "./env";

/**
 * 打开链接
 * @param url
 * @returns
 */
export const openUrl = (url?: string) => {
  if (!url) return;

  if (isElectron()) {
    window.__ELECTRON__.commonService.openExternal(url);

  } else {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  }
};


export function formatModelHost(host: string) {
  if (!host) return '';

  if (host.endsWith('/')) {
    return host;
  }

  if (host.endsWith('#')) {
    return host.slice(0, -1);
  }

  return `${host}/v1/chat/completions`;
}