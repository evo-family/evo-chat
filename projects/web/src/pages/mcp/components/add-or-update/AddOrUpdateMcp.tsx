import { Button, Form, message } from 'antd';
import { EMcpType, IMcpMeta } from '@evo/types';
import React, { FC, memo, useEffect } from 'react';
import {
  ModalForm,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { parseKeyValueText, stringifyKeyValueText } from '@evo/utils';
import s from './AddOrUpdataMcp.module.scss';
import {
  IIntelligentRecognitionData,
  IntelligentRecognition,
} from '../intelligent-recognition/IntelligentRecognition';

import { McpBridgeFactory } from '@evo/platform-bridge';
import { useMcpSelector } from '../../mcp-processor/McpProvider';
import { useRequest } from 'ahooks';

export interface IAddOrUpdateMcpProps {}

export interface IFormData extends IMcpMeta {
  command: string;
  args: string;
  env: { key: string; value: string }[];
  categoryName?: string;

  url?: string;
  headers: string;
}

export const AddOrUpdateMcp: FC<IAddOrUpdateMcpProps> = memo(() => {
  const dialogData = useMcpSelector((s) => s.addOrUpdateMcpDialog.dialogData);
  const closeDialog = useMcpSelector((s) => s.addOrUpdateMcpDialog.closeDialog);
  const createMcp = useMcpSelector((s) => s.createMcp);
  const updateMcp = useMcpSelector((s) => s.updateMcp);
  const [form] = Form.useForm();
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
      const envObj = config.env || {};
      const envList = Object.entries(envObj).map(([key, value]) => ({ key, value }));
      return {
        ...dialogData.data,
        type,
        command: config.command,
        args: config.args?.join('\n'),
        env: envList, //stringifyKeyValueText(config.env),
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

  useEffect(() => {
    if (dialogData.open) {
      form.setFieldsValue(getInitialValues());
    }
  }, [dialogData.open]);

  const getFormValues = (values: IFormData) => {
    const { command, args, env, url, headers, categoryName, ...otherValues } = values;
    let config = {};
    if (otherValues.type === EMcpType.STDIO) {
      const envObj: Record<string, string> = {};
      values.env?.forEach((item: { key: string; value: string }) => {
        if (item.key) {
          envObj[item.key] = item.value;
        }
      });
      config = {
        command: values.command,
        args: values.args?.split('\n').filter(Boolean) || [],
        env: envObj, // parseKeyValueText(values.env),
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

  const handleRecognition = (data: IIntelligentRecognitionData) => {
    form.setFieldsValue({ ...data });
  };

  return (
    <ModalForm<IFormData>
      title={dialogData.type === 'create' ? '创建 MCP' : '编辑 MCP'}
      open={dialogData.open}
      width={600}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: closeDialog,
        bodyStyle: {
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
        },
        centered: true,
      }}
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
            console.log(formValue);
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
      <IntelligentRecognition onRecognition={handleRecognition} />
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
              <ProFormTextArea
                rules={[{ required: true, message: '请输入参数' }]}
                name="args"
                label="参数"
                tooltip={{
                  title: `传递给执行命令的参数列表，一般在这里输入 MCP 服务器名称，或启动脚本路径。
                  每个参数占一行,例如文件MCP Server：
                  @modelcontextprotocol/server-filesystem
                  /Users/username/Desktop
                  /path/to/other/allowed/dir
                  `,
                  overlayStyle: { maxWidth: 300 },
                }}
                placeholder={`@modelcontextprotocol/server-filesystem
/Users/username/Desktop
/path/to/other/allowed/dir`}
              />
              <ProFormList
                name="env"
                label="环境变量"
                className={s.envList}
                tooltip={{
                  title: 'MCP Server环境变量，一般用来输入ACCESS_TOKEN等配置',
                }}
                creatorButtonProps={{
                  creatorButtonText: '新增一行',
                }}
                copyIconProps={false}
              >
                <ProFormGroup>
                  <ProFormText name="key" label="key" placeholder="key" />
                  <ProFormText
                    style={{ width: 300 }}
                    name="value"
                    label="value"
                    placeholder="value"
                  />
                </ProFormGroup>
              </ProFormList>
            </>
          );
        }}
      </Form.Item>
    </ModalForm>
  );
});
