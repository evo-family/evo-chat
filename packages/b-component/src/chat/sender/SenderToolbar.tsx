import { Badge, Button, Divider, Space, Tooltip } from 'antd';
import React, { FC } from 'react';

import { EvoIcon } from '../../icon';
import { KnowledgeToolbar } from './toolbar/KowledgeToolbar';
import { ModelParamConfig } from './toolbar/ModelParamConfig';
import { ModelSelectToolbar } from './toolbar/ModelSelectToolbar';
import classNames from 'classnames';
import { isElectron, isH5, isMobile, isMobileApp } from '@evo/utils';
import s from './SenderToolbar.module.scss';
import { MobilePermissionType } from '@evo/types';
import { McpSelectToolbar } from './toolbar/McpSelectToolbar';
import { SystemBridgeFactory } from '@evo/platform-bridge';

export interface ISenderToolbarProps {
  fileOpen: boolean;
  setFileOpen: (open: boolean) => void;
  fileItems: any[];
  mobileClickAttachment: () => void;
}

export const SenderToolbar: FC<ISenderToolbarProps> = React.memo((props) => {
  const { setFileOpen, fileOpen, fileItems, mobileClickAttachment } = props;
  const isEl = isElectron();
  return (
    <div className={s.toolbar}>
      <Space size={2} align="center">
        <Tooltip title="文件">
          <Badge dot={fileItems.length > 0 && !open}>
            <Button
              onClick={async () => {
                if (isMobileApp()) {
                  const result = await SystemBridgeFactory.getInstance().checkPermission?.([
                    MobilePermissionType.camera,
                    MobilePermissionType.microphone,
                    MobilePermissionType.mediaLibrary,
                  ]);
                  if (result) {
                    mobileClickAttachment();
                  }
                  return;
                } else if (isH5()) {
                  mobileClickAttachment();
                  return;
                }
                setFileOpen(!fileOpen);
              }}
              className={classNames('evo-button-icon')}
              size="small"
              type="text"
              icon={<EvoIcon size={'small'} type="icon-file" />}
            />
          </Badge>
        </Tooltip>
        <ModelParamConfig />
        {/* <Tooltip title="清除上下文">
          <Badge dot={fileItems.length > 0 && !open}>
            <Button
              className={classNames('evo-button-icon')}
              size="small"
              type="text"
              icon={<EvoIcon size={'small'} type="icon-file" />}
            />
          </Badge>
        </Tooltip> */}
        {isEl && <KnowledgeToolbar />}
        {<McpSelectToolbar />}
        <Divider type="vertical" style={{ margin: '0 10px' }} />
      </Space>
      <ModelSelectToolbar />
    </div>
  );
});
