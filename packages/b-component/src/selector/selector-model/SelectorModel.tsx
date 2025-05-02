import { Button, Divider, Select } from 'antd';
import React, { FC, forwardRef, memo, useMemo, useRef } from 'react';
import {
  ISelectModelsMapRef,
  IUseModelOptionsParams,
  useConvertModelSelect,
  useModelOptionsData,
} from '../../hooks';
import { SelectProps } from 'antd/lib';
import type { BaseSelectRef } from 'rc-select';
import { IAvailableModel } from '@evo/types';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

export interface ISelectorModelRef {
  selectRef: React.RefObject<BaseSelectRef>;
  selectModelsMapRef: React.RefObject<ISelectModelsMapRef>;
}

export interface ISelectorModelProps extends SelectProps {
  value?: IAvailableModel | IAvailableModel[];
  useModelOptionsParams?: IUseModelOptionsParams;
  showAddModel?: boolean; // 控制是否显示添加模型按钮
  returnArray?: boolean;
}

export const SelectorModel = memo(
  forwardRef<ISelectorModelRef, ISelectorModelProps>((props, ref) => {
    const {
      useModelOptionsParams,
      onChange,
      value,
      mode,
      showAddModel = true,
      returnArray,
      children,
      ...otherProps
    } = props;
    const navigate = useNavigate();
    const isMultiple = mode === 'multiple';
    const selectRef = useRef<BaseSelectRef>(null);
    const modelOptions = useModelOptionsData(useModelOptionsParams);
    const { selectModelsMapRef, getSelectValue, getSelectChangeModels } = useConvertModelSelect();

    React.useImperativeHandle(
      ref,
      () => ({
        selectRef: selectRef!,
        selectModelsMapRef: selectModelsMapRef,
      }),
      [selectRef, selectModelsMapRef]
    );

    const selectValue = useMemo(() => {
      const currValue = Array.isArray(value) ? value! : [value!];
      const result = getSelectValue(currValue as IAvailableModel[]);

      // 检查值是否在选项列表中
      const isValueInOptions = result?.some((val) =>
        modelOptions?.some((group) => group.options.some((option) => option.value === val))
      );

      // 如果是多选模式
      if (isMultiple) {
        return isValueInOptions ? result : [];
      }

      // 如果是单选模式
      return isValueInOptions ? result?.[0] : undefined;
    }, [value, isMultiple, modelOptions]);

    const handleChange = (value: string | string[]) => {
      if (!value) {
        onChange?.(null);
        return;
      }
      const models = getSelectChangeModels(value);
      onChange?.(isMultiple || returnArray ? models : models?.[0]);
    };

    return (
      <Select
        ref={selectRef}
        placeholder="请选择模型"
        {...otherProps}
        dropdownRender={(menu) => (
          <>
            {menu}
            {showAddModel && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <Button
                  style={{ width: '100%' }}
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    navigate('/settings');
                  }}
                >
                  添加模型
                </Button>
              </>
            )}
          </>
        )}
        mode={mode}
        value={selectValue}
        onChange={handleChange}
        options={modelOptions}
      >
        {children}
      </Select>
    );
  })
);
