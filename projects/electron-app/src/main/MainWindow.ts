import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import { logger } from './logger';
import { getAppIcon, getHtmlPath, getPreloadPath } from './utils/AppUtil';
let mainWindow: BrowserWindow | null = null;
/**
 * 获取主窗口
 * @returns
 */
export function getMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow;
  }
  return null;
}
export function createMainWindow() {
  const currMainWindow = getMainWindow();
  if (currMainWindow) {
    return mainWindow!;
  }
  const appIcon = getAppIcon('logo.png');
  const win = (mainWindow = new BrowserWindow({
    width: 1080,
    height: 600,
    minWidth: 1080,
    minHeight: 600,
    autoHideMenuBar: true,
    icon: appIcon,
    frame: true, // 使用原生窗口框架
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default', // macOS 隐藏标题栏，Windows 使用默认
    webPreferences: {
      nodeIntegration: true,
      preload: getPreloadPath(),
    },
  }));

  if (process.platform === 'darwin') {
    app.dock.setIcon(appIcon);
  }

  logger.info('窗口创建成功');

  // 创建右键菜单
  const contextMenu = new Menu();

  // contextMenu.append(new MenuItem({ type: 'separator' }))  // 分隔线
  contextMenu.append(
    new MenuItem({
      label: '开发者工具',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click: () => {
        win.webContents.toggleDevTools();
      },
    })
  );

  // 监听右键点击事件
  win.webContents.on('context-menu', () => {
    contextMenu.popup();
  });

  // 添加快捷键
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // 监听窗口崩溃事件，直接重新加载
  // win.webContents.on('crashed', () => {
  //   // 记录日志
  //   logger.error('窗口崩溃')
  //   win.reload()
  // })

  win.on('unresponsive', () => {
    // 记录日志
    logger.error('窗口无响应');
    win.reload();
  });

  // 监听窗口恢复响应
  win.on('responsive', () => {
    logger.info('窗口恢复响应');
  });

  win.loadURL(getHtmlPath());

  return win;
}

export function showMainWindow() {
  const currMainWindow = getMainWindow();
  if (currMainWindow) {
    if (currMainWindow.isMinimized()) {
      return currMainWindow.restore();
    }
    currMainWindow.show();
    currMainWindow.focus();
  } else {
    createMainWindow();
  }
}
