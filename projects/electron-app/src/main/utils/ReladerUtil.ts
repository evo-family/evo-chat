
import { app, BrowserWindow, nativeImage } from 'electron'
import path from 'path';
/**
 * 配置开发环境热更新
 */
export function setupHotReload() {
  if (process.env.NODE_ENV === 'development') {
    try {
      // 启用热更新
      require('electron-reloader')(module, {
        // 监听的目录
        watchPath: [
          path.join(process.cwd(), 'build'),
          path.join(process.cwd(), 'src/main'),
        ],
        // 忽略的文件
        ignore: [
          /node_modules/,
          /[\/\\]\./,
          /\.json$/
        ]
      });
    } catch (err) {
      console.error('热更新配置失败:', err);
    }
  }
}
