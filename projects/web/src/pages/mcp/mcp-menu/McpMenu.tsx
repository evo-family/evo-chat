import React, { FC, useEffect, useMemo } from 'react';
import { Menu, MenuProps } from 'antd';
import styles from './McpMenu.module.scss';
import { AddOrUpdateMcpCategory } from '../components/add-or-update/AddOrUpdateMcpCategory';
import { useMcpSelector } from '../mcp-processor/McpProvider';
import { Label, MenuItem } from '@evo/component';
import { isElectron } from '@evo/utils';

export interface IMcpMenuProps {
  onMenuClick?: (key: string) => void;
  selectable?: boolean;
}

export const McpMenu: FC<IMcpMenuProps> = ({ onMenuClick, selectable = true }) => {
  const categoryListResult = useMcpSelector((s) => s.categoryListResult);
  const getCategoryList = useMcpSelector((s) => s.getCategoryList);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const setSelectCategory = useMcpSelector((s) => s.setSelectCategory);

  useEffect(() => {
    if (isElectron()) {
      getCategoryList();
    }
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
          // TODO: 实现删除逻辑
        }
      },
    };
    return menuProps;
  }, []);

  const menuItems = useMemo(() => {
    return (
      categoryListResult?.data?.map((category) => {
        return {
          key: category.id,
          label: (
            <MenuItem
              name={category.name}
              operationContent={
                <MenuItem.MenuOperationDropdown
                  menus={dropdownMenu}
                  isActive={(selectable && selectCategory && selectCategory.id) === category.id}
                />
              }
            />
          ),
        };
      }) || []
    );
  }, [categoryListResult, selectCategory?.id, selectable]);

  const handleSelect = (key: string) => {
    onMenuClick?.(key);
    const curr = categoryListResult?.data?.find((f) => f.id === key);
    setSelectCategory(curr!);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Label size="middle">MCP 分类</Label>
        <AddOrUpdateMcpCategory />
      </div>
      <Menu
        items={menuItems}
        selectedKeys={selectable ? [selectCategory?.id!] : []}
        onClick={({ key }) => handleSelect?.(key)}
      />
    </div>
  );
};
