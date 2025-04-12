import React, { FC, memo } from 'react';
import {
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { EMcpType, IMcpMeta } from '@evo/types';
import { message } from 'antd';
import { useMcpSelector } from '../../mcp-processor/McpProvider';

export interface IAddOrUpdateMcpProps {}

export interface IFormData extends IMcpMeta {
  command: string;
  args: [];
  env: [];
}

export const AddOrUpdateMcp: FC<IAddOrUpdateMcpProps> = memo(() => {
  const dialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.dialogData);
  const closeDialog = useMcpSelector((s) => s.addOrUpdateMcpDialog.closeDialog);
  const createMcp = useMcpSelector((s) => s.createMcp);
  const updateMcp = useMcpSelector((s) => s.updateMcp);
  const selectCategory = useMcpSelector((s) => s.selectCategory);

  return (
    <ModalForm<IFormData>
      title={dialogData.type === 'create' ? '创建 MCP' : '编辑 MCP'}
      open={dialogData.open}
      width={600}
      modalProps={{
        destroyOnClose: true,
        onCancel: closeDialog,
        bodyStyle: {
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          paddingRight: 16,
        },
      }}
      grid={true}
      colProps={{ span: 24 }}
      layout="horizontal"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      initialValues={{
        ...dialogData.data,
        type: EMcpType.STDIO,
        config: {
          command: 'npx',
          args: [],
          env: {},
        },
      }}
      onFinish={async (values) => {
        const { command, args, env, ...otherValues } = values;
        try {
          const config = {
            command: values.command,
            // @ts-ignore
            args: values.args?.split(' ').filter(Boolean) || [],
            env: values.env || {},
          };

          if (dialogData.type === 'create') {
            const res = await createMcp({
              ...otherValues,
              categoryId: selectCategory!.id,
              config: JSON.stringify(config),
            });
            console.log('evo=>data', {
              ...values,
              categoryId: selectCategory!.id,
              config: JSON.stringify(config),
            });
            if (res.success) {
              message.success('创建成功');
            } else {
              message.error(res.error);
            }
          } else {
            const res = await updateMcp({
              ...dialogData.data,
              ...values,
            });
            if (res.success) {
              message.success('更新成功');
            } else {
              message.error(res.error);
            }
          }
          closeDialog();
        } catch (error: any) {
          message.error(error?.message);
          return false;
        }
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        placeholder="请输入名称"
        rules={[{ required: true, message: '请输入名称' }]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
        fieldProps={{ rows: 2 }}
      />
      <ProFormRadio.Group
        name="type"
        label="类型"
        rules={[{ required: true, message: '请选择类型' }]}
        options={[
          { label: '标准输入/输出(stdio)', value: EMcpType.STDIO },
          { label: '服务器发送事件(sse)', value: EMcpType.SSE },
        ]}
        initialValue={EMcpType.STDIO}
      />
      <ProFormSelect
        name="command"
        label="命令"
        placeholder="请选择命令"
        rules={[{ required: true, message: '请选择命令' }]}
        options={[
          { label: 'npx', value: 'npx' },
          { label: 'uvx', value: 'uvx' },
        ]}
        fieldProps={{
          allowClear: false,
        }}
      />
      <ProFormText name="args" label="参数" placeholder="请输入参数，以空格分隔" />
      <ProFormTextArea
        name="env"
        label="环境变量"
        placeholder="请输入环境变量 JSON"
        fieldProps={{ rows: 3 }}
        transform={(value: any) => {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }}
      />
    </ModalForm>
  );
});
