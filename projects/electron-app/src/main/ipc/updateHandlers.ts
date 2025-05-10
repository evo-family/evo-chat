import { app, ipcMain, dialog, shell } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import { IpcChannels } from '../constants/ipcChannels';
import { IPC_EVENTS } from '@evo/utils';
import { getMainWindow } from '../MainWindow';
import { isMacOS } from '../utils/PlatformUtil';

import icon from '../../../resources/logo.png?asset';

function formatReleaseNotes(releaseNotes: any): string {
  if (!releaseNotes) {
    return '暂无更新说明';
  }

  if (typeof releaseNotes === 'string') {
    return releaseNotes;
  }

  return releaseNotes.map((note) => note.note).join('\n');
}

export function setupAutoUpdataHandler() {
  // Configure logger
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;

  // 配置更新器
  autoUpdater.autoDownload = true;
  autoUpdater.allowDowngrade = false;
  autoUpdater.channel = 'latest';

  autoUpdater.on('checking-for-update', () => {
    log.info('正在检查更新...');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('检测到新版本', info);
    getMainWindow().webContents.send(IPC_EVENTS.UPDATE.AVAILABLE, info);
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    log.info('当前已是最新版本', info);
    getMainWindow()?.webContents.send(IPC_EVENTS.UPDATE.NOT_AVAILABLE, info);
  });

  autoUpdater.on('error', (err) => {
    log.error('更新出错', err);
    getMainWindow()?.webContents.send(IPC_EVENTS.UPDATE.ERROR, err);
    dialog.showErrorBox('更新错误', `检查更新时发生问题`);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`下载进度：${progressObj.percent}%`);
    getMainWindow()?.webContents.send(IPC_EVENTS.UPDATE.PROGRESS, progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('更新已下载', info);
    dialog
      .showMessageBox({
        type: 'info',
        title: '安装更新',
        icon,
        message: `新版本 ${info?.version} 已准备就绪`,
        detail: formatReleaseNotes(info?.releaseNotes),
        buttons: ['稍后安装', '立即安装'],
        defaultId: 1,
        cancelId: 0,
      })
      .then(({ response }) => {
        if (response === 1) {
          setImmediate(() => autoUpdater.quitAndInstall());
        } else {
          getMainWindow().webContents.send(IPC_EVENTS.UPDATE.CANCEL);
        }
      });
  });

  // 手动检查更新的 IPC 处理
  ipcMain.handle(IPC_EVENTS.UPDATE.CHECK, () => {
    // 开发环境下不执行更新检查
    if (!app.isPackaged) {
      log.info('开发环境下不检查更新');
      return;
    }
    autoUpdater.checkForUpdatesAndNotify();
  });
}
