import { Button, Space, Progress, Typography } from 'antd';
import React, { FC, memo, useState } from 'react';
import { useAutoUpdater } from './useAutoUpdater';
import { useSettingSelector } from '@evo/data-store';
import { checkForUpdate, isElectron } from '@evo/utils';

const { Text } = Typography;

export interface IUpdateProps {
}

export const Update: FC<IUpdateProps> = memo((props) => {

  const { downloadProgress, uploadLoading, checkUpdate } = useAutoUpdater({});
  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          {(downloadProgress !== null) && (
            <Progress
              type="circle"
              trailColor="#e6f4ff"
              percent={downloadProgress}
              strokeWidth={20}
              size={14}
              format={(number) => `进行中，已完成${number}%`}
            />
          )}
          <Button loading={uploadLoading} onClick={checkUpdate}>检查更新</Button>
        </Space>
      </Space>
    </div>
  );
});

