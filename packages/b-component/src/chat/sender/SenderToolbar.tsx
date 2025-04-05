import { Badge, Button, Divider, Space, Tooltip } from 'antd';
import React, { FC } from 'react';

import { EvoIcon } from '../../icon';
import { KnowledgeToolbar } from './toolbar/KowledgeToolbar';
import { ModelParamConfig } from './toolbar/ModelParamConfig';
import { ModelSelectToolbar } from './toolbar/ModelSelectToolbar';
import classNames from 'classnames';
import { isElectron, isH5, isMobile, isMobileApp } from '@evo/utils';
import s from './SenderToolbar.module.scss';
import { CommonBridgeFactory } from '@evo/platform-bridge';
import { MobilePermissionType } from '@evo/types';

export interface ISenderToolbarProps {
  fileOpen: boolean;
  setFileOpen: (open: boolean) => void;
  fileItems: any[];
  mobileClickAttachment: () => void;
}

export const SenderToolbar: FC<ISenderToolbarProps> = React.memo((props) => {
  const { setFileOpen, fileOpen, fileItems, mobileClickAttachment } = props;
  return (
    <div className={s.toolbar}>
      <Space size={2} align="center">
        <Tooltip title="文件">
          <Badge dot={fileItems.length > 0 && !open}>
            <Button

              onClick={async () => {
                if (isMobileApp()){
                  const result = await CommonBridgeFactory.getInstance().checkMobilePermission?.([MobilePermissionType.camera, MobilePermissionType.microphone, MobilePermissionType.mediaLibrary])
                  if (result) {
                    mobileClickAttachment()
                  }
                  return
                } else if (isH5()) {
                  mobileClickAttachment()
                  return
                }
                setFileOpen(!fileOpen)
              }}
              className={classNames('evo-button-icon')}
              size="small"
              type="text"
              icon={<EvoIcon size={'small'} type="icon-file" />}
            />
          </Badge>
        </Tooltip>
        <ModelParamConfig />
        <Tooltip title="清除上下文">
          <Badge dot={fileItems.length > 0 && !open}>
            <Button
              className={classNames('evo-button-icon')}
              size="small"
              type="text"
              icon={<EvoIcon size={'small'} type="icon-file" />}
            />
          </Badge>
        </Tooltip>
        {isElectron() && <KnowledgeToolbar />}
        {/* <Tooltip title="提及">
          <Button className={classNames('evo-button-icon')} size='small' type='text' icon={<EvoIcon size={'small'} type='icon-mention' />} />
        </Tooltip> */}
        <Divider type="vertical" style={{ margin: '0 10px' }} />
      </Space>
      <ModelSelectToolbar />
    </div>
  );
});
