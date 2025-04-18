import { app, Tray, Menu, nativeTheme, systemPreferences } from 'electron';
import path from 'path';
import { isLinux, isMacOS } from '../utils/PlatformUtil';
import { generateNativeImage, getResourcePath } from '../utils/AppUtil';
import { showMainWindow } from '../MainWindow';

export class TrayService {
  private tray: Tray | null = null;

  constructor() {
    this.createTray();
  }

  private subscribeNotification = () => {
    //增加系统颜色切换的时候，动态调整图标的状态
    systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
      setTimeout(() => {
        const iconImage = this.getIconImage();
        this.tray?.setImage(iconImage);
      }, 1000);
    });
  };
  private getIconImage() {
    let iconName = 'favicon.png';
    if (isMacOS()) {
      // 判断系统颜色
      if (!nativeTheme.shouldUseDarkColors) {
        iconName = 'favicon.png';
      } else {
        iconName = 'favicon_white.png';
      }
    }
    const path = getResourcePath(iconName);
    if (isMacOS() || isLinux()) {
      return generateNativeImage({
        path: path,
        size: 18,
      });
    }
    return path;
  }

  private createTray() {
    const iconName = this.getIconImage();
    // 创建托盘图标
    this.tray = new Tray(iconName);

    if (!this.tray) {
      return;
    }

    this.subscribeNotification();
    // 设置托盘图标提示文字
    this.tray.setToolTip('Evo Chat');

    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          showMainWindow();
        },
      },
      { type: 'separator' }, // 添加分隔线
      {
        label: '退出',
        click: () => {
          app.quit();
        },
      },
    ]);

    // 设置托盘菜单
    // this.tray.setContextMenu(contextMenu)

    this.tray.on('right-click', () => {
      this.tray?.popUpContextMenu(contextMenu);
    });

    this.tray.on('click', () => {
      showMainWindow();
    });
  }

  // 销毁托盘
  public destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
