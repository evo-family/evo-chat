
import { app, BrowserWindow, session, Menu, MenuItem } from 'electron';
import { createMainWindow, showMainWindow } from './MainWindow';
import { TrayService } from './services/TrayService';
import { isMacOS } from './utils/PlatformUtil';
import { ipcInit } from './ipc';
import { setupHotReload } from './utils/ReladerUtil';


// 如果返回 false，说明另一个实例已经在运行
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0)
} else {

  // setupHotReload();
  app.on("ready", () => {
    const mainWindow = createMainWindow();

    // 设置应用程序 ID
    app.setAppUserModelId('com.evochat.app');

    ipcInit();

    // 创建托盘服务
    const trayService = new TrayService();

    // app 激活
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      } else {
        showMainWindow();
      }
    })

    // 监听其他实例启动的事件
    app.on('second-instance', (event, argv, workingDirectory, additionalData) => {
      // 处理第二个实例启动时的逻辑
      if (mainWindow) {
        // 激活主窗口
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        mainWindow.show()
      }
    })

    // 当所有窗口关闭时
    app.on('window-all-closed', () => {
      // 在 macOS 上，除非用户使用 Cmd + Q 确定地退出
      // 否则绝大部分应用会选择隐藏窗口而不是退出
      if (!isMacOS()) {
        trayService.destroy()
        app.quit()
        process.exit(0)
      }
    })

  });
}

// 添加进程信号监听
if (process.env.NODE_ENV === 'development') {
  process.on('SIGINT', () => {
    console.log(1)
    app.quit()
  })
  process.on('SIGTERM', () => {
    console.log(2)
    app.quit()
  })
}
