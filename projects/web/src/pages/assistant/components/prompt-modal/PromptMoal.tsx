import { Button, Form, Modal, Space } from 'antd';
import React, { FC, useState } from 'react';
import { IAssistantMeta } from '@evo/types';
import { useAssistantOperation, useCreateAssistantWindow } from '@evo/data-store';
import { useMemoizedFn } from 'ahooks';
import { MarkdownRender } from '@evo/component';

export interface IPromptModalProps {
  data: IAssistantMeta;
}

export const PromptModal: FC<IPromptModalProps> = React.memo((props) => {
  const { data } = props;
  const [open, setOpen] = useState(false);
  const { updateAssistant } = useAssistantOperation();
  const { createAssistantWindow } = useCreateAssistantWindow();

  const handlePrompt = useMemoizedFn(() => {
    setOpen(true);
  });

  const handleClose = useMemoizedFn(() => {
    setOpen(false);
  });

  const createWindow = () => {
    createAssistantWindow(data);
  };

  // 添加常用助手
  const handleAddAssistant = () => {
    updateAssistant({
      ...data,
      isFrequent: true,
    });
  };

  const addAndCreateWindow = useMemoizedFn(async (startChat: boolean = false) => {
    handleAddAssistant();
    createWindow();
  });

  return (
    <>
      <Button color="default" variant="filled" onClick={handlePrompt}>
        提示词
      </Button>
      <Modal
        title={data.title}
        open={open}
        width={800}
        onCancel={handleClose}
        centered
        styles={{
          body: { minHeight: 200, maxHeight: 450, overflow: 'auto' },
        }}
        footer={
          <Space>
            <Button onClick={handleClose}>取消</Button>
            {data.isFrequent ? (
              <Button type="primary" onClick={createWindow}>
                开启新对话
              </Button>
            ) : (
              <>
                <Button onClick={handleAddAssistant}>添加助手</Button>
                <Button type="primary" onClick={() => addAndCreateWindow(true)}>
                  添加助手并会话
                </Button>
              </>
            )}
          </Space>
        }
      >
        <MarkdownRender content={data.prompt} />
      </Modal>
    </>
  );
});
