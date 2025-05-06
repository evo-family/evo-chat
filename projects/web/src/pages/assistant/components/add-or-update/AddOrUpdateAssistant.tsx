import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Emoji, EvoIcon, SelectorKnowledge, SelectorMcp, SelectorModel } from '@evo/component';
import { Button, ConfigProvider, Form, Input, Menu, message, Space, theme } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import s from './Style.module.scss';
import { IAssistantMeta } from '@evo/types';
import { ContentPanel } from '../../../../components';
import { useAssistantOperation } from '@evo/data-store';
import { useRef } from 'react';
import { useAssistantSelector } from '../../assistant-processor/AssistantProvider';
export interface AssistantFormValues
  extends Pick<IAssistantMeta, 'avatar' | 'description' | 'prompt' | 'title'> {}

interface AddOrUpdateAssistantProps {}

const MENU_DATA = [
  {
    key: 'basic',
    label: '基本信息',
  },

  {
    key: 'model',
    label: '模型配置',
  },
  {
    key: 'knowledge',
    label: '知识库',
  },
  {
    key: 'mcp',
    label: 'MCP',
  },
];

export const AddOrUpdateAssistant: React.FC<AddOrUpdateAssistantProps> = ({}) => {
  const [form] = Form.useForm();
  const [selectKey, setSelectKey] = useState('basic');

  const dialogData = useAssistantSelector((s) => s.addOrUpdateAssistantDialog.dialogData);
  const closeDialog = useAssistantSelector((s) => s.addOrUpdateAssistantDialog.closeDialog);
  const { createAssistant, updateAssistant } = useAssistantOperation();
  const formValuesRef = useRef<IAssistantMeta>({} as IAssistantMeta);

  const setSelectedCategoryId = useAssistantSelector((s) => s.setSelectedCategoryId);
  useEffect(() => {
    if (dialogData.type === 'update' || dialogData.type === 'copy') {
      form.setFieldsValue(dialogData.data);
      formValuesRef.current = dialogData.data;
    }
  }, [dialogData.type, dialogData.data]);

  const menus = useMemo(() => {
    return MENU_DATA.map((item) => {
      return {
        ...item,
        onClick: () => {
          setSelectKey(item.key);
        },
      };
    });
  }, [MENU_DATA]);

  const handleFinish = async (values: IAssistantMeta) => {
    try {
      formValuesRef.current.model?.availableModels;
      if (dialogData.type === 'create' || dialogData.type === 'copy') {
        const result = await createAssistant(formValuesRef.current);
        if (result) {
          setSelectedCategoryId('my');
          message.success('创建成功');
        }
      } else {
        const id = dialogData.data?.id! as string;
        const res = await updateAssistant({ ...formValuesRef.current, id });
        if (res) {
          message.success('更新成功');
          closeDialog();
        } else {
          message.error('更新失败');
        }
      }

      console.log('提交的数据：', formValuesRef.current);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <ModalForm<IAssistantMeta>
        title={dialogData.type === 'create' ? '创建助手' : dialogData.data?.title}
        open={dialogData.open}
        form={form}
        autoFocusFirstInput
        onValuesChange={(changedValues, allValues) => {
          formValuesRef.current = Object.assign(formValuesRef.current, allValues);
        }}
        modalProps={{
          styles: {
            body: {
              padding: 0,
            },
          },
          destroyOnClose: true,
          onCancel: () => {
            closeDialog();
            form.resetFields();
          },
          centered: true, // 设置弹框垂直居中
        }}
        onFinish={async (values) => {
          const success = await handleFinish(values);
          if (success) {
            form.resetFields();
            closeDialog();
            return true;
          }
          return false;
        }}
        // 设置表单项布局
        layout="horizontal"
        grid={false}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <ContentPanel
          style={{ height: 400 }}
          hiddenHeader
          leftContent={
            <ConfigProvider
              theme={
                {
                  // algorithm: [theme.compactAlgorithm],
                }
              }
            >
              <Menu
                className={'evo-menu'}
                defaultSelectedKeys={[selectKey]}
                mode="inline"
                items={menus}
              />
            </ConfigProvider>
          }
        >
          {selectKey === 'basic' && (
            <>
              <Form.Item label="图标" name="avatar">
                <Emoji />
              </Form.Item>

              <ProFormText
                // addonBefore={}
                name="title"
                label="助手名称"
                placeholder="请输入助手名称"
                style={{ width: '100%' }}
                rules={[{ required: true, message: '请输入名称' }]}
              />

              <ProFormTextArea
                name="description"
                autoSize={{ minRows: 1, maxRows: 1 }}
                label="描述"
                placeholder="请输入描述"
                fieldProps={{
                  autoSize: { minRows: 2, maxRows: 2 },
                }}
              />
              <ProFormTextArea
                name="prompt"
                fieldProps={{
                  autoSize: { minRows: 6, maxRows: 6 },
                }}
                rules={[{ required: true, message: '请输提示词' }]}
                label="提示词"
                placeholder="请输提示词"
              />
            </>
          )}

          {selectKey === 'model' && (
            <Form.Item
              label="默认模型"
              name={['model', 'availableModels']}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <SelectorModel
                returnArray
                allowClear
                useModelOptionsParams={{ showProvider: true }}
              ></SelectorModel>
            </Form.Item>
          )}

          {selectKey === 'knowledge' && (
            <Form.Item
              label="知识库"
              name={['knowledgeIds']}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
            >
              <SelectorKnowledge showSearch={false} allowClear />
            </Form.Item>
          )}

          {selectKey === 'mcp' && (
            <Form.Item
              label="MCP"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              name={['mcpIds']}
            >
              <SelectorMcp />
            </Form.Item>
          )}
        </ContentPanel>
      </ModalForm>
    </>
  );
};
