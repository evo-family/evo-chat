import { ChatWindow, useGlobalCtx } from '@evo/data-store';
import { Dropdown, Form, MenuProps, Modal } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useMemoizedFn, useUpdate } from 'ahooks';

import { EllipsisOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import s from './ChatItemMenu.module.scss';
import { useCellValue } from '@evo/utils';

export interface IChatItemMenuProps {
  onAction?: (winId: string, action: string) => void;
  chatIns: ChatWindow;
}

export interface IChatMenuRenameForm {
  title: string;
}

export const ChatItemMenu: FC<IChatItemMenuProps> = ({ onAction, chatIns }) => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);
  const [winId] = useCellValue(chatIns.configState.getCellSync('id'));

  const [renameVisible, setReanmeVisible] = useState(false);

  const [form] = Form.useForm<IChatMenuRenameForm>();

  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = useMemoizedFn((key: string) => {
    if (!winId) return;

    onAction?.(winId, key);

    switch (key) {
      case 'rename':
        setReanmeVisible(true);
        console.log('重命名:', winId);
        break;
      case 'export_md':
        console.log('导出到 Markdown:', winId);
        break;
      case 'export_image':
        console.log('导出到图片:', winId);
        break;
      case 'delete':
        chatCtrl.removeWindow(winId);
        console.log('删除:', winId);
        break;
    }
  });

  const closeRename = useMemoizedFn(() => setReanmeVisible(false));

  const handleRename = useMemoizedFn(async (formData: IChatMenuRenameForm) => {
    chatIns.configState.setCellValueSync('manualTitle', formData.title);

    closeRename();
  });

  const dropdownMenu: MenuProps = useMemo(() => {
    const menuProps: MenuProps = {
      items: [
        {
          key: 'rename',
          label: '重命名',
        },
        {
          key: 'export',
          label: '导出',
          children: [
            {
              key: 'export_md',
              label: '导出到 Markdown',
            },
            {
              key: 'export_image',
              label: '导出到图片',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: '删除',
          danger: true,
        },
      ],
      onClick: ({ key }) => handleMenuClick(key),
    };

    return menuProps;
  }, [handleMenuClick]);

  return (
    <>
      <Dropdown
        menu={dropdownMenu}
        trigger={['click']}
        placement="bottomLeft"
        overlayStyle={{ minWidth: 120 }}
        onOpenChange={setIsOpen}
      >
        <EllipsisOutlined
          className={classNames(s.menuIcon, {
            [s.visible]: isOpen || winId === curWinId, // 修改这里，增加 active 条件
          })}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
      <ModalForm
        open={renameVisible}
        title="重命名"
        width={400}
        form={form}
        autoFocusFirstInput
        initialValues={{
          title: chatIns.configState.getCellSync('manualTitle')?.get(),
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: closeRename,
        }}
        submitTimeout={1000}
        onFinish={handleRename}
      >
        <ProFormText
          name={'title'}
          label="聊天名称"
          rules={[
            {
              required: true,
              message: '聊天名称不能为空',
            },
          ]}
          placeholder="请输入名称"
        />
      </ModalForm>
    </>
  );
};
