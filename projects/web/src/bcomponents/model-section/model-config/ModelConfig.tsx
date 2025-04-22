import { Avatar, Button, Flex, Form, Input, message, Select, Space, Tooltip } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { getModelLogo, useModelSelector } from '@evo/data-store';
import { SettingGroup } from '../../../components';
import { AddOrUpdateModel } from '../add-or-updata-model/AddOrUpdateModel';
import { IModel } from '@evo/types';
import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { formatModelHost, openUrl } from '@evo/utils';
import { ModelList } from '../model-list/ModelList';
import { Label, ModelType } from '@evo/component';
interface IModelConfigProps {}

export const ModelConfig: FC<IModelConfigProps> = () => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [selectModel, testModelConnect, changeModel, removeModel] = useModelSelector((s) => [
    s.selectModel,
    s.testModelConnect,
    s.changeModel,
    s.removeModel,
  ]);

  const modelDialog = useModelSelector((s) => s.modelDialog);

  useEffect(() => {
    if (selectModel) {
      form.setFieldsValue({
        key: selectModel.apiInfo?.key,
        url: selectModel.apiInfo?.url,
      });
    }
  }, [selectModel]);

  const onValuesChange = (changedValues: any, allValues: any) => {
    changeModel({ apiInfo: changedValues });
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields(['key', 'url']);
      // const values = form.getFieldsValue();
      setTesting(true);
      const isConnection = await testModelConnect({
        apiKey: values.key,
        apiUrl: values.url,
        model: selectModel?.groups?.[0].models?.[0]!,
      });

      if (isConnection) {
        message.success('连接成功');
      } else {
        message.error('连接失败');
      }
    } catch (error) {
      console.log('error=>', error);
      message.error('连接失败');
    } finally {
      setTesting(false);
    }
  };

  if (!selectModel) {
    return <></>;
  }

  return (
    <div>
      <Label size="large" bold style={{ marginBottom: 6 }}>
        {selectModel?.name} 配置
        {selectModel.webSite?.official && (
          <Tooltip title="官网">
            <Button
              type="link"
              onClick={() => {
                openUrl(selectModel.webSite?.official);
              }}
              style={{ fontSize: 14 }}
              icon={<LinkOutlined />}
            />
          </Tooltip>
        )}
      </Label>
      <Form<IModel>
        form={form}
        layout="vertical"
        style={{ width: '100%' }}
        onValuesChange={onValuesChange}
      >
        <Form.Item
          label="API Key"
          name="key"
          rules={[{ required: true, message: '请输入 API Key' }]}
          extra={
            <a
              style={{ fontSize: 12 }}
              type="link"
              onClick={() => {
                openUrl(selectModel.webSite?.models);
              }}
            >
              点击获取密钥
            </a>
          }
        >
          <Input.Password
            style={{ width: '100%' }}
            placeholder="请输入 API Key"
            addonAfter={
              <Button type="link" size="small" onClick={handleTest} loading={testing}>
                测试连接
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          label="API 地址"
          name="url"
          rules={[{ required: true, message: '请输入 API 地址' }]}
          extra={
            <Flex justify="space-between" align="center">
              <span style={{ color: '#ccc', fontSize: 12 }}>
                {formatModelHost(selectModel.apiInfo?.url)}
              </span>
              <span style={{ color: '#ccc', fontSize: 12 }}>
                /结尾忽略v1版本，#结尾强制使用输入地址
              </span>
            </Flex>
          }
        >
          <Input style={{ width: '100%' }} placeholder="请输入 API 地址" />
        </Form.Item>

        <Form.Item label="模型">
          {selectModel?.groups?.map((group) => {
            return (
              <SettingGroup key={group.groupName} title={group.groupName}>
                {group?.models?.map((model) => {
                  return (
                    <SettingGroup.Item
                      key={model.id}
                      title={
                        <Space>
                          <Avatar
                            size={'small'}
                            src={<img src={getModelLogo(model.id)} alt="avatar" />}
                          />
                          {model.id}
                          <ModelType types={model.type} />
                        </Space>
                      }
                    >
                      <>
                        <Space>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                              modelDialog.setDialogData({
                                open: true,
                                type: 'update',
                                data: {
                                  groupName: group.groupName,
                                  ...model,
                                },
                              });
                            }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              removeModel(group.groupName, model.id);
                            }}
                          />
                        </Space>
                      </>
                    </SettingGroup.Item>
                  );
                })}
              </SettingGroup>
            );
          })}
        </Form.Item>
      </Form>

      <Space>
        <ModelList />
        <AddOrUpdateModel />
      </Space>
    </div>
  );
};
