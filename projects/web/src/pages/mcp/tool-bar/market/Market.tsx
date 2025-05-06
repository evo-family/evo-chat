import { Button, Modal } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import React, { FC, memo, useState } from 'react';
import { McpMarket } from '@evo/component';

export interface IMarketProps {}

export const Market: FC<IMarketProps> = memo((props) => {
  const [open, setOpen] = useState(false);

  const handleOpenMarket = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        className={'evo-button-icon'}
        color="default"
        variant="filled"
        icon={<ShopOutlined />}
        onClick={handleOpenMarket}
      >
        MCP市场
      </Button>
      <Modal
        title="MCP市场"
        open={open}
        onCancel={() => setOpen(false)}
        width={800}
        footer={null}
        destroyOnClose
      >
        <McpMarket
        // data={[]}  // 这里需要传入MCP列表数据
        // onInstall={(mcp) => {
        //   // 处理安装逻辑
        //   console.log('安装MCP:', mcp);
        // }}
        // onUninstall={(mcp) => {
        //   // 处理卸载逻辑
        //   console.log('卸载MCP:', mcp);
        // }}
        />
      </Modal>
    </>
  );
});
