import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useModelSelector } from '@evo/data-store';
import { EModelType } from '@evo/types';
import { Button, Form, Tag } from 'antd';
import React, { FC, memo, useEffect, useMemo } from 'react';
import { MODEL_TYPE_CONFIG, getModelTypeOptions } from '@evo/data-store';

export interface IAddOrUpdateModelProps {
}

export const AddOrUpdateModel: FC<IAddOrUpdateModelProps> = memo((props) => {
  const dialogData = useModelSelector(s => s.modelDialog.dialogData)
  const closeDialog = useModelSelector(s => s.modelDialog.closeDialog)
  const setCreateModalData = useModelSelector(s => s.modelDialog.setCreateModalData);
  const addSingleModel = useModelSelector(s => s.addSingleModel);
  const updateSingleModel = useModelSelector(s => s.updateSingleModel);
  const [form] = Form.useForm();

  const isCreate = dialogData.type === 'create';

  const modelTypeOptions = useMemo(() => getModelTypeOptions(), []);

  useEffect(() => {
    if (dialogData.type === 'update' && dialogData.open) {
      form.setFieldsValue({
        id: dialogData.data?.id,
        name: dialogData.data?.name,
        groupName: dialogData.data?.groupName,
        type: dialogData.data?.type,
      })
    }
  }, [dialogData.data])

  return (
    <>
      <Button onClick={() => {
        setCreateModalData();
      }}>手动添加</Button>
      <ModalForm
        title={isCreate ? '添加模型' : '修改模型'}
        width={400}
        form={form}
        autoFocusFirstInput
        open={dialogData?.open}
        modalProps={{
          destroyOnClose: true,
          onCancel: closeDialog,
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          try {
            const data = {
              groupName: values.groupName,
              modelSchema: {
                id: values.id,
                name: values.name,
                type: values.type || [],
              },
            };
            // 创建数据
            if (dialogData.type === 'create') {
              addSingleModel(data)
            }
            if (dialogData.type === 'update') {
              updateSingleModel({ ...data, oldGroupName: dialogData.data?.groupName })
            }
            closeDialog();

          } catch (error) {
            return false;
          }
        }}
      >
        <ProFormText
          name={['id']}
          label="模型id"
          disabled={!isCreate}
          rules={[
            {
              required: true,
              message: '请输入名称！',
            },
          ]}
          placeholder="必填 例如gpt-3.5-turbo"
        />
        <ProFormText
          name={['name']}
          label="模型名称"
          placeholder="例如GPT3.5"
        />
        <ProFormSelect
          name="type"
          label="模型类型"
          mode="multiple"
          options={modelTypeOptions}
          placeholder="请选择模型类型"
          fieldProps={{
            tagRender: ({ label, value, closable, onClose }) => (
              <Tag
                color={MODEL_TYPE_CONFIG[value as EModelType]?.color}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
              >
                {label}
              </Tag>
            ),
            optionRender: (option) => (
              <Tag color={MODEL_TYPE_CONFIG[option.value as EModelType]?.color}>
                {option.label}
              </Tag>
            ),
          }}
        />
        <ProFormText
          name={['groupName']}
          label="分组名称"
          placeholder="例如ChatGPT"
        />

      </ModalForm>
    </>
  );
})

