import { app, nativeImage } from 'electron';
import path from 'path';

/**
 * 根据路径重新生成图片
 * @param params
 * @returns
 */
export const generateNativeImage = (params: { path: string; size?: number }) => {
  const { path, size = 16 } = params;
  const image = nativeImage.createFromPath(path);
  const resizedImage = image.resize({ width: size, height: size });
  resizedImage.setTemplateImage(true);
  return resizedImage;
};

/**
 * 获取预加载路径
 * @returns
 */
export function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.js');
  return app.isPackaged
    ? path.join(__dirname, '../preload.js')
    : path.join(process.cwd(), './build/preload.js');
}

/**
 * 获取资源路径
 * @param paths
 * @returns
 */
export function getResourcePath(...paths: string[]): string {
  const resourcePath = app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, '../../resources');
  return path.join(resourcePath, ...paths);
}

export function getAppIcon(iconName) {
  const iconPath = getResourcePath(iconName);
  console.log('evo=>icon-path', iconPath);
  const icon = nativeImage.createFromPath(iconPath);
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }
  return icon;
}

/**
 * 获取html路径
 * @param htmlFileName
 * @returns
 */
export function getHtmlPath(htmlFileName?: string) {
  // const url = new URL(`http://localhost:8888/#/home`);
  // if (htmlFileName) {
  //   url.pathname = htmlFileName;
  // }
  // return url.href;
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(`http://localhost:8888/#/home`);
    if (htmlFileName) {
      url.pathname = htmlFileName;
    }
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', `${htmlFileName || 'index'}.html`)}`;
}
