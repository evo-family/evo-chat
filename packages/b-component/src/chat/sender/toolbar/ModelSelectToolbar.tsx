import { Avatar, Button, Divider, message, Select, SelectProps, Space, Tag, Tooltip } from 'antd';
import React, { FC, memo, useMemo, useRef, useState } from 'react';
import { getModelLogo, useChatWinCtx, useGlobalCtx } from '@evo/data-store';

import { EvoIcon } from '../../../icon';
import { IAvailableModel, IModelSchema } from '@evo/types';
import classNames from 'classnames';
import { useAsyncEffect } from 'ahooks';
import { useSenderSelector } from '../sender-processor/SenderProvider';
import { useConvertModelSelect, useModelOptionsData } from '../../../hooks';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

export interface IModelSelectToolbarProps {}

export const ModelSelectToolbar: FC<IModelSelectToolbarProps> = memo((props) => {
  const navigate = useNavigate();
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const [selectValues, setSelectValues] = useState<string[]>([]);

  const removeLastAtChar = useSenderSelector((s) => s.removeLastAtChar);
  const modelSelectOpen = useSenderSelector((s) => s.modelSelectOpen);
  const setModelSelectOpen = useSenderSelector((s) => s.setModelSelectOpen);
  const senderRef = useSenderSelector((s) => s.senderRef);

  const { selectModelsMapRef, getSelectValue, getSelectChangeModels } = useConvertModelSelect();

  // 设置默认当前选中
  useAsyncEffect(async () => {
    const models = chatWin.getConfigState('models');
    const currSelectValues = getSelectValue(models!);
    setSelectValues(currSelectValues);
  }, [chatWin]);

  const modelOptions = useModelOptionsData();

  const handleChange = async (values: string[]) => {
    const selectedModels = getSelectChangeModels(values);
    chatWin?.updateConfigModels(selectedModels);
    setSelectValues(values);
    // 移除关闭弹框的逻辑
    removeLastAtChar();
    // senderRef.current?.focus();
  };

  const tagRender: SelectProps['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const info = selectModelsMapRef.current?.[value];

    const modelId = info?.model?.id;
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
        bordered={false}
      >
        {!modelId ? (
          label
        ) : (
          <>
            <Space size={2} align="center">
              <Avatar style={{ marginTop: '-2px' }} size={16} src={getModelLogo(modelId)} />
              {modelId}({info.providerName})
            </Space>
          </>
        )}
      </Tag>
    );
  };

  const selectRef = React.useRef<any>(null);

  // 监听 modelSelectOpen 变化
  React.useEffect(() => {
    if (modelSelectOpen) {
      // 延迟一帧等待 Select 完全展开
      requestAnimationFrame(() => {
        selectRef.current?.focus();
      });
    }
  }, [modelSelectOpen]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tooltip title="选择模型">
        <Button
          className={classNames('evo-button-icon')}
          type="text"
          size="small"
          icon={<EvoIcon size={'small'} type="icon-model" />}
          onClick={() => {
            setModelSelectOpen(!modelSelectOpen);
          }}
        />
      </Tooltip>
      <Select
        ref={selectRef}
        style={{ width: '100%' }}
        mode="multiple"
        tagRender={tagRender}
        maxCount={4}
        maxTagCount={'responsive'}
        suffixIcon={null}
        maxTagTextLength={5}
        showSearch={false}
        value={selectValues}
        getPopupContainer={(triggerNode) => {
          return (triggerNode.parentNode as HTMLElement) || document.body;
        }}
        onChange={handleChange}
        options={modelOptions}
        onDropdownVisibleChange={setModelSelectOpen}
        open={modelSelectOpen}
        dropdownStyle={{ width: 400, left: -30 }}
        variant="borderless"
        dropdownRender={(menu) => (
          <>
            {menu}
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
      />
    </div>
  );
});
