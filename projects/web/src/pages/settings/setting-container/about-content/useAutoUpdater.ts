import { checkForUpdate, IPC_EVENTS, isMacOS } from '@evo/utils';
import { useEffect, useState } from 'react';
import { message, notification } from 'antd';
import { CommonBridgeFactory } from '@evo/platform-bridge';

interface IUseAutoUpdater {
  updateErrorCallback?: (error: any) => void;
}

export function useAutoUpdater(params: IUseAutoUpdater) {
  const { updateErrorCallback } = params;
  const [uploadLoading, setUpdataLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  useEffect(() => {
    // 监听新版本可用
    const onUpdateAvailable = (_event: any, info: any) => {
      console.log('发现新版本:', info);
      if (isMacOS()) {
        CommonBridgeFactory.getInstance().openExternal("https://www.evoai.com/download")
        setUpdataLoading(false);
      }

    };

    // 监听当前已是最新版本
    const onUpdateNotAvailable = (_event: any, info: any) => {
      message.info({
        content: '当前已是最新版本',
      });
      setUpdataLoading(false);
    };

    // 监听下载进度
    const onDownloadProgress = (_event: any, progressObj: any) => {
      const p = Math.floor(progressObj.percent);
      if (p == 100) {
        setUpdataLoading(false);
      }
      setDownloadProgress(p);

    };

    // 注册监听器
    window.__ELECTRON__.ipcRenderer.on(IPC_EVENTS.UPDATE.AVAILABLE, onUpdateAvailable);
    window.__ELECTRON__.ipcRenderer.on(IPC_EVENTS.UPDATE.NOT_AVAILABLE, onUpdateNotAvailable);
    window.__ELECTRON__.ipcRenderer.on(IPC_EVENTS.UPDATE.PROGRESS, onDownloadProgress);
    window.__ELECTRON__.ipcRenderer.on(IPC_EVENTS.UPDATE.ERROR, (event, error) => {
      updateErrorCallback?.(error);
      setUpdataLoading(false);
    })

    window.__ELECTRON__.ipcRenderer.on(IPC_EVENTS.UPDATE.CANCEL,() => {
      setUpdataLoading(false);
      message.info({
        content: '更新已取消',
      });
    });

    // 清理监听器
    return () => {
      window.__ELECTRON__.ipcRenderer.removeListener(IPC_EVENTS.UPDATE.AVAILABLE, onUpdateAvailable);
      window.__ELECTRON__.ipcRenderer.removeListener(IPC_EVENTS.UPDATE.NOT_AVAILABLE, onUpdateNotAvailable);
      window.__ELECTRON__.ipcRenderer.removeListener(IPC_EVENTS.UPDATE.PROGRESS, onDownloadProgress);
    };
  }, []);

  const checkUpdate = async () => {
    setUpdataLoading(true);
    checkForUpdate();
  }



  return {
    downloadProgress,
    uploadLoading,
    checkUpdate
  };
}