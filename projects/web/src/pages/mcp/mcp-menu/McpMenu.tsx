import React, { FC, useEffect, useMemo } from 'react';
import { Menu, MenuProps, message, Modal } from 'antd';
import styles from './McpMenu.module.scss';
import { AddOrUpdateMcpCategory } from '../components/add-or-update/AddOrUpdateMcpCategory';
import { useMcpSelector } from '../mcp-processor/McpProvider';
import { Label, MenuItem } from '@evo/component';
import { isElectron } from '@evo/utils';
import { useMemoizedFn } from 'ahooks';

export interface IMcpMenuProps {
  onMenuClick?: (key: string) => void;
  selectable?: boolean;
}

export const McpMenu: FC<IMcpMenuProps> = ({ onMenuClick, selectable = true }) => {
  const categoryListResult = useMcpSelector((s) => s.categoryListResult);
  const getCategoryList = useMcpSelector((s) => s.getCategoryList);
  const selectCategory = useMcpSelector((s) => s.selectCategory);
  const setSelectCategory = useMcpSelector((s) => s.setSelectCategory);
  const setUpdateModalData = useMcpSelector((s) => s.addOrUpdateCategoryDialog.setUpdateModalData);
  const mcpList = useMcpSelector((s) => s.mcpListResult || []);
  const deleteCategory = useMcpSelector((s) => s.deleteCategory);

  useEffect(() => {
    getCategoryList();
  }, []);

  const update = useMemoizedFn(() => {
    const data = categoryListResult?.data?.find((f) => f.id === selectCategory?.id);
    setUpdateModalData({ data });
  });

  const handleDelete = useMemoizedFn(async () => {
    if (!selectCategory) return;

    try {
      // 检查分类下是否有内容
      const hasContent = mcpList?.data?.length;
      Modal.confirm({
        title: '删除确认',
        content: hasContent ? '该分类下存在内容，是否一并删除？' : '确定要删除该分类吗？',
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: async () => {
          try {
            const result = await deleteCategory(selectCategory?.id);
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
  }, [selectCategory]);

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
