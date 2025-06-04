import { Popup, SearchBar, CheckList } from 'antd-mobile';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { EvoSelectProps } from './EvoSelect';
import s from './EvoSelect.module.less';
import { DefaultOptionType } from 'antd/es/select';

export interface IMobileEvoSelectProps extends EvoSelectProps {
  children?: React.ReactElement
}

export const MobileEvoSelect: FC<IMobileEvoSelectProps> = props => {
  const { className, style, open, value, onChange, showSearch, options, placeholder, optionRender, children, selectProps, ...restProps } = props;

  const { mode, onDropdownVisibleChange } = selectProps || {};
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState(value);

  const isGroup = Array.isArray(options) && options.some(opt => Array.isArray(opt.options) && opt.options.length > 0);
  const isMultiple = mode == 'multiple';
  // 受控 value 优先级
  const checkListValue = props.value !== undefined ? props.value : selected;

  const checkListValueArr = Array.isArray(checkListValue) ? checkListValue : (checkListValue != null ? [checkListValue] : []);

  const handleCheckListChange = (val: any[]) => {
    setSelected(isMultiple ? val : val?.[0]);
    if (props.onChange) {
      props.onChange(isMultiple ? val : val?.[0]);
    }
    onDropdownVisibleChange?.(false);
    setVisible(false);
  };

  useEffect(() => {
    setVisible(open!);
  }, [open])
  return (
    <>
      <div
        className={classNames(s.mobileSelect, className)}
        style={style}
      // onClick={() => setVisible(true)}
      >
        {children}
      </div>
      <Popup visible={visible}
        onMaskClick={() => {
          onDropdownVisibleChange?.(false);
          setVisible(false)
        }}

        destroyOnClose>
        {
          showSearch && <div className={s.searchBarContainer}>
            <SearchBar
              placeholder="输入文字过滤选项"
              value={searchText}
              onChange={(v) => setSearchText(v)}
            />
          </div>
        }
        <div className={s.checkListContainer}>
          {isGroup ? (
            options.map(group => (
              <div key={String(group.label)}>
                <div className={s.groupTitle}>{group.label}</div>
                <CheckList
                  className={s.myCheckList}
                  value={checkListValueArr}
                  multiple={isMultiple}
                  onChange={handleCheckListChange}
                >
                  {(group?.options || []).filter((item: any) => filterItem(item, searchText)).map((item: any) => (
                    <CheckList.Item key={item.value ?? ''} value={item.value ?? ''}>
                      {optionRender ? optionRender(item) : item.label}
                    </CheckList.Item>
                  ))}
                </CheckList>
              </div>
            ))
          ) : (
            <CheckList
              className={s.myCheckList}
              value={checkListValueArr}
              multiple={isMultiple}
              onChange={handleCheckListChange}
            >
              {options.filter(item => filterItem(item, searchText)).map(item => (
                <CheckList.Item key={item.value ?? ''} value={item.value ?? ''}>
                  {optionRender ? optionRender(item) : item.label}
                </CheckList.Item>
              ))}
            </CheckList>
          )}
        </div>
      </Popup>
    </>

  );
}




// 辅助函数：查找 value 对应的 label
function findLabelByValue(options: DefaultOptionType[], value: any): React.ReactNode {
  for (const opt of options) {
    if (opt.children) {
      const found = findLabelByValue(opt.children, value);
      if (found) return found;
    } else if (opt.value === value) {
      return opt.label ?? value;
    }
  }
  return value;
}

// 辅助函数：过滤搜索
function filterItem(item: DefaultOptionType, searchText: string) {
  if (!searchText) return true;
  let labelStr = '';
  if (typeof item.label === 'string') {
    labelStr = item.label;
  } else if (item.label != null) {
    try {
      labelStr = String(item.label);
    } catch {
      labelStr = '';
    }
  }
  let valueStr = '';
  if (typeof item.value === 'string') {
    valueStr = item.value;
  } else if (item.value != null) {
    valueStr = String(item.value);
  }
  labelStr = labelStr.toString();
  valueStr = valueStr.toString();
  return labelStr.toLowerCase().includes(searchText.toLowerCase()) || valueStr.toLowerCase().includes(searchText.toLowerCase());
}
