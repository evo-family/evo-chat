import React, { FC, memo } from 'react';
import { FileActions } from './components/FileActions';
import s from './FileList.module.scss';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { EResourceType, IFileMeta } from '@evo/types';
import dayjs from 'dayjs';
import { UploadBridgeFactory } from '@evo/platform-bridge';
import { FileAvatar, FilePreview } from '@evo/component';
import { useFileSelector } from '../file-processor/FileProvider';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';

export interface IFieListProps { }

export const FieList: FC<IFieListProps> = memo((props) => {
  const [searchKey, setSearchKey] = React.useState('');
  const menuSelectKey = useFileSelector(s => s.menuSelectKey);
  const tableActionRef = useFileSelector(s => s.tableActionRef);
  const { run: handleSearch } = useDebounceFn(
    (value: string) => {
      setSearchKey(value);
    },
    { wait: 300 }
  );

  // 定义表格列
  const columns: ProColumns<IFileMeta>[] = [
    {
      title: ' ',
      dataIndex: 'id',
      ellipsis: true,
      width: 40,
      render: (_, record) => {
        return <FileAvatar id={record.id} name={record.name} />
      },
    },
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true,
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 120,
      render: (_, record) => {
        const size = record.size;
        if (size < 1024) return `${size}B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
        return `${(size / (1024 * 1024)).toFixed(2)}MB`;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, record) => record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedTime',
      width: 180,
      render: (_, record) => record.modifiedTime ? dayjs(record.modifiedTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a key="view" onClick={() => {
          FilePreview.show(record);
        }}>
          查看
        </a>,
        <a key="view" onClick={() => {
          handleContent(record.id);
        }}>
          获取内容
        </a>,
        <a key="delete" onClick={() => console.log('删除文件', record)}>
          删除
        </a>,
      ],
    },
  ];

  const handleContent = async (id: string) => {
    const data = await UploadBridgeFactory.getUpload().getFileContent(id);
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Input
            placeholder="搜索文件"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
        <div className={s.headerRight}>
          <FileActions />
        </div>
      </div>
      <div className={s.content}>
        <ProTable<IFileMeta>
          actionRef={tableActionRef}
          columns={columns}
          params={{
            menuType: menuSelectKey,
            search: searchKey
          }}
          request={async (params) => {
            const { menuType, search } = params;
            const res = await UploadBridgeFactory.getUpload().getFileList({
              type: menuType as EResourceType,
              search
            });

            return {
              data: res.data || [],
              success: res.success,
              total: res.data?.length || 0,
            };
          }}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
          }}
          search={false}
          dateFormatter="string"
          headerTitle="文件列表"
          toolBarRender={false}
        />
      </div>
    </div>
  );
});

