import React, { FC, memo } from 'react';
import {
  ModalForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { EMcpType, IMcpMeta } from '@evo/types';
import { Button, Form, message } from 'antd';
import { useMcpSelector } from '../../mcp-processor/McpProvider';
import { McpBridgeFactory } from '@evo/platform-bridge';
import { useRequest } from 'ahooks';
import { parseKeyValueText, stringifyKeyValueText } from '@evo/utils';

export interface IAddOrUpdateMcpProps {}

export interface IFormData extends IMcpMeta {
  command: string;
  args: string;
  env: string;
  categoryName?: string;

  url?: string;
  headers: string;
}

export const AddOrUpdateMcp: FC<IAddOrUpdateMcpProps> = memo(() => {
  const dialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.dialogData);
  const closeDialog = useMcpSelector((s) => s.addOrUpdateMcpDialog.closeDialog);
  const createMcp = useMcpSelector((s) => s.createMcp);
  const updateMcp = useMcpSelector((s) => s.updateMcp);
  const selectCategory = useMcpSelector((s) => s.selectCategory);

  const getInitialValues = () => {
    const defaultValues = {
      type: EMcpType.STDIO,
      command: 'npx',
      args: '',
      env: '',
    };

    if (dialogData.type === 'create') {
      return defaultValues;
    }

    const config = JSON.parse(dialogData.data?.config || '{}');
    const type = dialogData.data?.type;
    if (type === EMcpType.STDIO) {
      return {
        ...dialogData.data,
        type,
        command: config.command,
        args: config.args?.join(' '),
        env: stringifyKeyValueText(config.env),
      };
    }
    if (type === EMcpType.SSE) {
      return {
        ...dialogData.data,
        type,
        url: config.url,
        headers: stringifyKeyValueText(config.headers),
      };
    }
  };

  const getFormValues = (values: IFormData) => {
    const { command, args, env, url, headers, categoryName, ...otherValues } = values;
    let config = {};
    if (otherValues.type === EMcpType.STDIO) {
      config = {
        command: values.command,
        args: values.args?.split(' ').filter(Boolean) || [],
        env: parseKeyValueText(values.env),
      };
    }
    if (otherValues.type === EMcpType.SSE) {
      config = {
        url: url,
        headers: parseKeyValueText(headers),
      };
    }

    const result = {
      ...otherValues,
      categoryId: selectCategory!.id,
      config: JSON.stringify(config),
    };

    return result;
  };

  const { loading, run: testConnection } = useRequest(
    async (values: IFormData) => {
      const formValue = getFormValues(values);
      const res = await McpBridgeFactory.getInstance().startService(formValue);
      if (res.success) {
        message.success('连接测试成功');
      } else {
        message.error(res.error || '连接测试失败');
      }
      return res;
    },
    {
      manual: true,
    }
  );

  return (
    <ModalForm<IFormData>
      title={dialogData.type === 'create' ? '创建 MCP' : '编辑 MCP'}
      open={dialogData.open}
      width={600}
      modalProps={{
        destroyOnClose: true,
        onCancel: closeDialog,
        style: { top: 40 },
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
      initialValues={getInitialValues()}
      onFinish={async (values) => {
        try {
          const formValue = getFormValues(values);
          if (dialogData.type === 'create') {
            const res = await createMcp(formValue);
            if (res.success) {
              message.success('创建成功');
              closeDialog();
            } else {
              message.error(res.error);
            }
          } else {
            const id = dialogData.data?.id! as string;
            const res = await updateMcp({ ...formValue, id });
            if (res.success) {
              message.success('更新成功');
              closeDialog();
            } else {
              message.error(res.error);
            }
          }
        } catch (error: any) {
          message.error(error?.message);
          return false;
        }
      }}
      submitter={{
        render: (props) => {
          return [
            <Button key="cancel" onClick={closeDialog}>
              取消
            </Button>,
            <Button
              key="test"
              loading={loading}
              onClick={() => {
                const values = props.form?.getFieldsValue();
                testConnection(values);
              }}
            >
              测试连接
            </Button>,
            <Button
              key="submit"
              type="primary"
              {...props.submitButtonProps}
              onClick={() => {
                props.submit?.();
              }}
            >
              保存
            </Button>,
          ];
        },
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

      <Form.Item noStyle shouldUpdate>
        {(form) => {
          const type = form.getFieldValue('type');
          if (type === EMcpType.SSE) {
            return (
              <>
                <ProFormText
                  name="url"
                  label="地址"
                  placeholder="请输入服务器地址"
                  rules={[{ required: true, message: '请输入服务器地址' }]}
                />
                <ProFormTextArea
                  name="headers"
                  label="请求头"
                  placeholder="请输入http得请求头"
                  fieldProps={{ rows: 3 }}
                />
              </>
            );
          }
          return (
            <>
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
              />
            </>
          );
        }}
      </Form.Item>
    </ModalForm>
  );
});
