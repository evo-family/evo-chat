import React, { FC, memo, useState } from 'react';
import s from './MenuItem.module.scss';
import { Dropdown, DropDownProps, MenuProps } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export interface MenuOperationDropdownProps {
  menus: MenuProps;
  dropDownProps?: DropDownProps;
  isActive: boolean;
  children?: React.ReactElement;
}

export const MenuOperationDropdown: FC<MenuOperationDropdownProps> = (props) => {
  const { dropDownProps, menus, isActive, children } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Dropdown
        menu={menus}
        trigger={['click']}
        placement="bottomLeft"
        overlayStyle={{ minWidth: 120 }}
        onOpenChange={setIsOpen}
        {...dropDownProps}
      >
        <EllipsisOutlined
          className={classNames(s.menuIcon, {
            [s.visible]: isOpen || isActive, // 修改这里，增加 active 条件
          })}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
      {children}
    </>
  );
};

export interface IMenuItemProps {
  name: React.ReactNode;
  operationContent?: React.ReactElement;
}

export const MenuItem = (props: IMenuItemProps) => {
  const { name, operationContent } = props;
  return (
    <div className={s.item}>
      <span className={s.content}>{name}</span>
      {operationContent && <div className={s.rightContent}>{operationContent}</div>}
    </div>
  );
};

MenuItem.MenuOperationDropdown = MenuOperationDropdown;
