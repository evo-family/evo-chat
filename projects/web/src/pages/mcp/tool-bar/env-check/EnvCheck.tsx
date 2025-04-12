import React, { FC, useEffect, useState } from 'react';
import { Button, Modal, Descriptions, Badge, Space, Tooltip } from 'antd';
import s from '../Toolbar.module.scss';
import { CliBridgeFactory } from '@evo/platform-bridge';

export const EnvCheck: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bunStatus, setBunStatus] = useState<'success' | 'error'>('error');
  const [uvStatus, setUvStatus] = useState<'success' | 'error'>('error');
  const [bunPath, setBunPath] = useState<string | null>(null);
  const [uvPath, setUvPath] = useState<string | null>(null);

  const handleCheck = async () => {
    try {
      const [bunResult, uvResult] = await Promise.all([
        CliBridgeFactory.getInstance().checkBunCommand(),
        CliBridgeFactory.getInstance().checkUvCommand(),
      ]);

      setBunStatus('error');
      // setBunStatus(bunResult.success && bunResult.data ? 'success' : 'error');
      setUvStatus(uvResult.success && uvResult.data ? 'success' : 'error');

      // 重置路径状态
      setBunPath(null);
      setUvPath(null);
    } catch (error) {
      console.error('环境检查失败:', error);
      setBunStatus('error');
      setUvStatus('error');
      setBunPath(null);
      setUvPath(null);
    }
  };

  const handleGetPaths = async () => {
    if (bunStatus === 'success') {
      const bunPathResult = await CliBridgeFactory.getInstance().getCommandPath('bun');
      setBunPath(bunPathResult.success && bunPathResult.data ? bunPathResult.data : null);
    }
    if (uvStatus === 'success') {
      const uvPathResult = await CliBridgeFactory.getInstance().getCommandPath('uv');
      setUvPath(uvPathResult.success && uvPathResult.data ? uvPathResult.data : null);
    }
  };

  useEffect(() => {
    handleCheck();
  }, []);

  return (
    <>
      <Tooltip title="检查 Bun 和 UV 命令是否已安装">
        <Button
          type="text"
          onClick={async () => {
            setIsModalOpen(true);
            await handleCheck();
            await handleGetPaths();
          }}
        >
          <Badge
            status={bunStatus === 'success' && uvStatus === 'success' ? 'success' : 'error'}
            text="环境检查"
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
            <Descriptions.Item label="Bun">
              <Space>
                <Badge status={bunStatus} text={bunStatus === 'success' ? '已安装' : '未安装'} />
                {bunStatus === 'success' && bunPath && <div className={s.path}>{bunPath}</div>}
                {bunStatus === 'error' && (
                  <a href="https://bun.sh" target="_blank" rel="noopener noreferrer">
                    点击安装 Bun
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
