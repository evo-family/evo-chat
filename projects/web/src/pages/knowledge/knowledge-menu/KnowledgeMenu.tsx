import React, { FC, useEffect, useMemo } from 'react';
import { Button, Menu, Space, Dropdown, MenuProps, message, Modal } from 'antd';
import { DatabaseOutlined, MoreOutlined } from '@ant-design/icons';
import styles from './KnowledgeMenu.module.scss';
import { AddOrUpdateKnowledge } from '../components/add-or-update/AddOrUpdateKnowledge';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';
import { MenuItem } from '@evo/component';
import Item from 'antd/es/list/Item';
import { useGlobalCtx } from '@evo/data-store';
import { isElectron } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IKnowledgeMenuProps {
  onMenuClick?: (key: string) => void;
  selectable?: boolean;
}

export const KnowledgeMenu: FC<IKnowledgeMenuProps> = ({ onMenuClick, selectable = true }) => {
  const knowledgeListResult = useKnowledgeSelector((s) => s.knowledgeListResult);
  const getKnowledgeList = useKnowledgeSelector((s) => s.getKnowledgeList);
  const selectKnowledge = useKnowledgeSelector((s) => s.selectKnowledge);
  const setSelectKnowledge = useKnowledgeSelector((s) => s.setSelectKnowledge);
  const setUpdateModalData = useKnowledgeSelector((s) => s.addOrUploadDialog.setUpdateModalData);
  const deleteKnowledge = useKnowledgeSelector((s) => s.deleteKnowledge);
  useEffect(() => {
    if (isElectron()) {
      getKnowledgeList();
    }
  }, []);

  const update = useMemoizedFn(() => {
    const data = knowledgeListResult?.data?.find((f) => f.id === selectKnowledge?.id);
    setUpdateModalData({ data });
  });

  const handleDelete = useMemoizedFn(async () => {
    if (!selectKnowledge) return;

    try {
      Modal.confirm({
        title: '删除确认',
        content: '确定要删除该知识库吗？',
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: async () => {
          try {
            const result = await deleteKnowledge(selectKnowledge?.id);
            if (!result.success) {
              message.error('删除失败');
            }
          } catch (error) {
            message.error('删除失败');
          }
        },
      });
    } catch (error) {
      message.error('删除失败');
    }
  });

  const dropdownMenu: MenuProps = useMemo(() => {
    const menuProps: MenuProps = {
      items: [
        {
          key: 'edit',
          label: '编辑',
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          label: '删除',
          danger: true,
        },
      ],
      onClick: ({ key }) => {
        if (key === 'edit') {
          update();
          return;
        }

        if (key === 'delete') {
          handleDelete();
        }
      },
    };
    return menuProps;
  }, [selectKnowledge]);

  const menuItems = useMemo(() => {
    return (
      knowledgeListResult?.data?.map((f) => {
        return {
          key: f.id,
          // icon: <DatabaseOutlined />,
          label: (
            <MenuItem
              name={f.name}
              operationContent={
                <MenuItem.MenuOperationDropdown
                  menus={dropdownMenu}
                  isActive={(selectable && selectKnowledge && selectKnowledge.id) == f.id}
                />
              }
            />
          ),
        };
      }) || []
    );
  }, [knowledgeListResult, selectKnowledge?.id, selectable]);

  const handleSelect = (key: string) => {
    onMenuClick?.(key);
    const curr = knowledgeListResult?.data?.find((f) => f.id === key);
    setSelectKnowledge(curr!);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>知识库</span>
        <AddOrUpdateKnowledge />
      </div>
      <Menu
        items={menuItems}
        selectedKeys={selectable ? [selectKnowledge?.id!] : []}
        onClick={({ key }) => handleSelect?.(key)}
      />
    </div>
  );
};
