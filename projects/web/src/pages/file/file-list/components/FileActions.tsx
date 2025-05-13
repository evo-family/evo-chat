import React, { FC } from 'react';
import { Button, Space, message } from 'antd';
import { UploadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { UploadBridgeFactory } from '@evo/platform-bridge';
import { useFileSelector } from '../../file-processor/FileProvider';

export const FileActions: FC = () => {
  const tableActionRef = useFileSelector((s) => s.tableActionRef);
  const handleUploadFile = async () => {
    try {
      const result = await UploadBridgeFactory.getUpload().uploadFile();
      if (result.success) {
        tableActionRef.current?.reloadAndRest?.();
        message.success('文件上传成功');
      } else {
        message.error(`上传失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('上传文件出错:', error);
      message.error('上传文件时发生错误');
    }
  };

  const handleUploadFolder = async () => {
    try {
      const result = await UploadBridgeFactory.getUpload().uploadDirectory();
      if (result.success) {
        tableActionRef.current?.reloadAndRest?.();
        message.success('文件夹上传成功');
      } else {
        message.error(`上传失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('上传文件夹出错:', error);
      message.error('上传文件夹时发生错误');
    }
  };

  return (
    <Space>
      <Button
        className={'evo-button-icon'}
        color="default"
        variant="filled"
        icon={<FolderOpenOutlined />}
        onClick={handleUploadFolder}
      >
        上传文件夹
      </Button>
      <Button type="primary" icon={<UploadOutlined />} onClick={handleUploadFile}>
        上传文件
      </Button>
    </Space>
  );
};
