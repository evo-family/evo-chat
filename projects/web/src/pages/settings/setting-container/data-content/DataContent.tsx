import React, { FC, useMemo, useState } from 'react';
import { Button, message, Modal, Space, Switch } from 'antd';
import { SettingGroup } from '../../../../components';
import { useGlobalCtx, useSettingSelector } from '@evo/data-store';
import { useMemoizedFn, useRequest } from 'ahooks';
import { clearDataCellStorageWithWeb, clearStateTissueStorageWithWeb } from '@evo/utils';
import { SystemBridgeFactory } from '@evo/platform-bridge';
import { FileOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const DataContent: FC = React.memo(() => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [systemBridgeFactory] = useState(SystemBridgeFactory.getInstance());

  const { data: logPath } = useRequest(
    async () => {
      const result = await systemBridgeFactory.getLogPath();
      return result?.data;
    },
    {
      refreshDeps: [systemBridgeFactory],
    }
  );

  const clearLocalCache = useMemoizedFn(async () => {
    clearDataCellStorageWithWeb();
    clearStateTissueStorageWithWeb();
    const res = await systemBridgeFactory.clearLocalData();
    if (res.success) {
      message.info('操作成功');
    } else {
      message.warning('操作失败');
    }
  });

  const clearLocalChatCache = useMemoizedFn(() => {
    chatCtrl.getWindowList().then((list) => {
      list.forEach((winIns) => winIns.destroy());
    });
  });

  const handleClearChat = useMemoizedFn(() => {
    Modal.confirm({
      title: '确认清空所有会话数据？',
      content: '清空后将无法恢复，请谨慎操作',
      okText: '确认',
      cancelText: '取消',
      onOk: clearLocalChatCache,
    });
  });

  const handleClearCache = useMemoizedFn(() => {
    Modal.confirm({
      title: '确认清空所有本地缓存？',
      content: '清空后将无法恢复，请谨慎操作',
      okText: '确认',
      cancelText: '取消',
      onOk: clearLocalCache,
    });
  });

  const handleResetSettings = useMemoizedFn(() => {
    Modal.confirm({
      title: '确认重置所有设置？',
      content: '重置后将恢复默认设置，请谨慎操作',
      okText: '确认',
      cancelText: '取消',
      onOk: clearLocalCache,
    });
  });

  const openLog = () => {
    if (logPath) {
      systemBridgeFactory.openFile(logPath);
    }
  };

  return (
    <>
      <SettingGroup title="数据备份">
        <SettingGroup.Item title="导出数据" description="将所有聊天记录和设置导出为文件">
          <Button onClick={() => {}}>导出</Button>
        </SettingGroup.Item>
        <SettingGroup.Item title="导入数据" description="从备份文件中恢复数据">
          <Button onClick={() => {}}>导入</Button>
        </SettingGroup.Item>
      </SettingGroup>

      <SettingGroup title="数据清理">
        <SettingGroup.Item
          title="清空所有会话数据"
          description="删除所有的聊天记录和会话窗口（此操作不可恢复）"
        >
          <Button danger onClick={handleClearChat}>
            清空
          </Button>
        </SettingGroup.Item>
        <SettingGroup.Item
          title="清空所有本地数据"
          description="清除应用的本地数据，包括临时文件和存储（此操作不可恢复）"
        >
          <Button danger onClick={handleClearCache}>
            清空
          </Button>
        </SettingGroup.Item>
        <SettingGroup.Item
          title="重置所有设置"
          description="将所有设置恢复为默认值，包括主题、语言等配置（此操作不可恢复）"
        >
          <Button danger onClick={handleResetSettings}>
            重置
          </Button>
        </SettingGroup.Item>
      </SettingGroup>

      <SettingGroup title="数据目录">
        <SettingGroup.Item title="应用日志">
          <Space size={4}>
            {logPath}
            <Tooltip title="打开日志文件">
              <Button color="default" variant="text" icon={<FileOutlined />} onClick={openLog} />
            </Tooltip>
          </Space>
        </SettingGroup.Item>
      </SettingGroup>
    </>
  );
});
