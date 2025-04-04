import React, { FC, memo } from 'react';
import { FileActions } from './components/FileActions';
import s from './FileList.module.scss';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { EResourceType, IFileMeta } from '@evo/types';
import dayjs from 'dayjs';
import { UploadBridgeFactory } from '@evo/platform-bridge';
import { FileAvatar, FilePreview, SearchInput } from '@evo/component';
import { useFileSelector } from '../file-processor/FileProvider';
import { Space, Modal } from 'antd';
import { useContentPanelSelector } from '../../../components';
import { formatFileSize } from '@evo/utils';

export interface IFieListProps {}

export const FieList: FC<IFieListProps> = memo((props) => {
  const [searchKey, setSearchKey] = React.useState('');
  const menuSelectKey = useFileSelector((s) => s.menuSelectKey);
  const tableActionRef = useFileSelector((s) => s.tableActionRef);
  const ToolbarPortal = useContentPanelSelector((s) => s.ToolbarPortal);

  const columns: ProColumns<IFileMeta>[] = [
    {
      title: ' ',
      dataIndex: 'id',
      width: 25,
      align: 'right',
      render: (_, record) => {
        return <FileAvatar id={record.id} name={record.name} />;
      },
    },
    {
      title: '文件名',
      dataIndex: 'name',
      ellipsis: true,
      width: 60,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 30,
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 40,
      render: (_, record) => {
        return formatFileSize(record.size);
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 40,
      render: (_, record) =>
        record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD') : '-',
    },
    {
      title: '修改时间',
      dataIndex: 'modifiedTime',
      width: 40,
      render: (_, record) =>
        record.modifiedTime ? dayjs(record.modifiedTime).format('YYYY-MM-DD') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 40,
      render: (_, record) => [
        <a
          key="view"
          onClick={(e) => {
            FilePreview.show(record);
          }}
        >
          查看
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: `确定要删除文件 "${record.name}" 吗？`,
              okText: '删除',
              okType: 'danger',
              cancelText: '取消',
              onOk: () => {
                // UploadBridgeFactory.getUpload().
                console.log('删除文件', record);
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <div className={s.container}>
      <ToolbarPortal>
        <Space>
          <SearchInput placeholder="搜索文件" onSearch={setSearchKey} />
          <FileActions />
        </Space>
      </ToolbarPortal>
      <div className={s.content}>
        <ProTable<IFileMeta>
          actionRef={tableActionRef}
          columns={columns}
          params={{
            menuType: menuSelectKey,
            search: searchKey,
          }}
          request={async (params) => {
            const { menuType, search } = params;
            const res = await UploadBridgeFactory.getUpload().getFileList({
              type: menuType as EResourceType,
              search,
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
