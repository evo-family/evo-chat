import React, { FC, useEffect, useMemo } from 'react';
import { Button, Menu, Space, Dropdown, MenuProps } from 'antd';
import { DatabaseOutlined, MoreOutlined } from '@ant-design/icons';
import styles from './KnowledgeMenu.module.scss';
import { AddOrUpdateKnowledge } from '../components/add-or-update/AddOrUpdateKnowledge';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';
import { MenuItem } from '@evo/component';
import Item from 'antd/es/list/Item';

export interface IKnowledgeMenuProps {
  onMenuClick?: (key: string) => void;
  selectable?: boolean;
}

export const KnowledgeMenu: FC<IKnowledgeMenuProps> = ({ onMenuClick, selectable = true }) => {
  const knowledgeListResult = useKnowledgeSelector((s) => s.knowledgeListResult);
  const getKnowledgeList = useKnowledgeSelector((s) => s.getKnowledgeList);
  const selectKnowledge = useKnowledgeSelector((s) => s.selectKnowledge);
  const setSelectKnowledge = useKnowledgeSelector((s) => s.setSelectKnowledge);
  useEffect(() => {
    getKnowledgeList();
  }, []);

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
          return;
        }

        if (key === 'delete') {
        }
      },
    };
    return menuProps;
  }, []);

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
        <h4>知识库</h4>
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
