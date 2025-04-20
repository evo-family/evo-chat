import React, { FC, useEffect, useState } from 'react';
import { Button, Modal, Descriptions, Badge, Space, Tooltip } from 'antd';
import s from '../Toolbar.module.scss';
import { CliBridgeFactory } from '@evo/platform-bridge';

export const EnvCheck: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [npxStatus, setNpxStatus] = useState<'success' | 'error'>('error');
  const [uvStatus, setUvStatus] = useState<'success' | 'error'>('error');
  const [npxPath, setNpxPath] = useState<string | null>(null);
  const [uvPath, setUvPath] = useState<string | null>(null);

  const handleCheck = async () => {
    try {
      const [npxResult, uvResult] = await Promise.all([
        CliBridgeFactory.getInstance().checkNpxCommand(),
        CliBridgeFactory.getInstance().checkUvCommand(),
      ]);

      setNpxStatus(npxResult.success && npxResult.data ? 'success' : 'error');
      setUvStatus(uvResult.success && uvResult.data ? 'success' : 'error');

      setNpxPath(null);
      setUvPath(null);
    } catch (error) {
      console.error('环境检查失败:', error);
      setNpxStatus('error');
      setUvStatus('error');
      setNpxPath(null);
      setUvPath(null);
    }
  };

  const handleGetPaths = async () => {
    if (npxStatus === 'success') {
      const npxPathResult = await CliBridgeFactory.getInstance().getCommandPath('npx');
      setNpxPath(npxPathResult.success && npxPathResult.data ? npxPathResult.data : null);
    }
    if (uvStatus === 'success') {
      const uvPathResult = await CliBridgeFactory.getInstance().getCommandPath('uv');
      setUvPath(uvPathResult.success && uvPathResult.data ? uvPathResult.data : null);
    }
  };

  useEffect(() => {
    handleCheck();
  }, []);

  const isSuccess = npxStatus === 'success' && uvStatus === 'success';

  return (
    <>
      <Tooltip title="检查 npx 和 UV 命令是否已安装">
        <Button
          type="text"
          onClick={async () => {
            setIsModalOpen(true);
            await handleCheck();
            await handleGetPaths();
          }}
        >
          <Badge
            status={isSuccess ? 'success' : 'error'}
            text={isSuccess ? '环境可用' : '环境异常'}
          />
        </Button>
      </Tooltip>

      <Modal
        title="环境状态检查"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions column={1}>
            <Descriptions.Item label="npx">
              <Space>
                <Badge status={npxStatus} text={npxStatus === 'success' ? '已安装' : '未安装'} />
                {npxStatus === 'success' && npxPath && <div className={s.path}>{npxPath}</div>}
                {npxStatus === 'error' && (
                  <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
                    点击安装 Node.js
                  </a>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="UV">
              <Space>
                <Badge status={uvStatus} text={uvStatus === 'success' ? '已安装' : '未安装'} />
                {uvStatus === 'success' && uvPath && <div className={s.path}>{uvPath}</div>}
                {uvStatus === 'error' && (
                  <a
                    href="https://github.com/astral-sh/uv"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    点击安装 UV
                  </a>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Modal>
    </>
  );
};
