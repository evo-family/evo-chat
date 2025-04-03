import React, { FC, memo, useEffect } from 'react';
import { CheckCard, ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Button, Form } from 'antd';
import { useModelSelector } from '@evo/data-store';
import { IModel } from '@evo/types';
export interface IAddModelProviderProps {
}

// 权限组数据
const providerTypeData = [
  {
    label: 'OpenAi',
    value: 'OpenAi',
  }
];


export const AddModelProvider: FC<IAddModelProviderProps> = memo((props) => {
  const [form] = Form.useForm<IModel>();
  const modalData = useModelSelector(s => s.modelProviderDialog.dialogData)
  const setDialogData = useModelSelector(s => s.modelProviderDialog.setDialogData)
  const addModelProvider = useModelSelector(s => s.addModelProvider)

  useEffect(() => {
    if (modalData?.open && modalData?.data) {
      form.setFieldsValue(modalData.data!);
    }
  }, [modalData?.open]);

  const closeModal = () => {
    setDialogData({
      open: false,
    })
  }

  const openModal = () => {
    setDialogData({
      open: true,
    })
  }


  return (
    <>
      <Button onClick={openModal} style={{ width: '100%' }}>添加</Button>
      <ModalForm
        title={'创建'}
        width={400}
        form={form}
        autoFocusFirstInput
        open={modalData?.open}
        modalProps={{
          destroyOnClose: true,
          onCancel: closeModal,
        }}
        submitTimeout={2000}
        onFinish={async (values: IModel) => {
          try {

            // 创建数据
            if (modalData.type === 'create') {
              addModelProvider({
                name: values.name,
                provider: values.provider,
              })
            }
            closeModal();

          } catch (error) {
            return false;
          }
        }}
      >
        <ProFormText
          name={['name']}
          label="供应商名称"
          rules={[
            {
              required: true,
              message: '请输入名称！',
            },
          ]}
          placeholder="请输入供应商名称"
        />
        <ProFormSelect
          name={['provider']}
          label="供应业类型"
          placeholder={'请选择供应商'}
          initialValue={providerTypeData[0].value}
          request={async () => providerTypeData}
        ></ProFormSelect>
      </ModalForm>
    </>

  );
})

