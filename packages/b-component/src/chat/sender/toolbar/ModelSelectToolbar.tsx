import { Avatar, Button, Divider, message, Select, SelectProps, Space, Tag, Tooltip } from 'antd';
import React, { FC, memo, useMemo, useRef, useState } from 'react';
import { getModelLogo, useChatWinCtx, useGlobalCtx } from '@evo/data-store';

import { EvoIcon } from '../../../icon';
import { IAvailableModel, IModelSchema } from '@evo/types';
import classNames from 'classnames';
import { useAsyncEffect } from 'ahooks';
import { useSenderSelector } from '../sender-processor/SenderProvider';
import { useModelOptionsData } from '../../../hooks';
import { useNavigate } from 'react-router';
import { ISelectorModelRef, SelectorModel } from '../../../selector';

export interface IModelSelectToolbarProps {}

export const ModelSelectToolbar: FC<IModelSelectToolbarProps> = memo((props) => {
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);

  const selectModelRef = useRef<ISelectorModelRef>(null);

  const [selectModels, setSelectModels] = useState<IAvailableModel[]>([]);

  const removeLastAtChar = useSenderSelector((s) => s.removeLastAtChar);
  const modelSelectOpen = useSenderSelector((s) => s.modelSelectOpen);
  const setModelSelectOpen = useSenderSelector((s) => s.setModelSelectOpen);
  const senderRef = useSenderSelector((s) => s.senderRef);

  // 设置默认当前选中
  useAsyncEffect(async () => {
    const models = chatWin.getConfigState('models');
    setSelectModels(models);
  }, [chatWin]);

  const handleChange = async (models: IAvailableModel[]) => {
    chatWin?.updateConfigModels(models);
    setSelectModels(models);
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
    const info = selectModelRef?.current?.selectModelsMapRef.current?.[value];

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

  // 监听 modelSelectOpen 变化
  React.useEffect(() => {
    if (modelSelectOpen) {
      // 延迟一帧等待 Select 完全展开
      requestAnimationFrame(() => {
        selectModelRef?.current?.selectRef.current?.focus();
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
      <SelectorModel
        style={{ width: '100%' }}
        placeholder=""
        ref={selectModelRef}
        mode="multiple"
        tagRender={tagRender}
        maxCount={4}
        maxTagCount={'responsive'}
        suffixIcon={null}
        maxTagTextLength={5}
        showSearch={false}
        value={selectModels}
        getPopupContainer={(triggerNode) => {
          return (triggerNode.parentNode as HTMLElement) || document.body;
        }}
        onChange={handleChange}
        onDropdownVisibleChange={setModelSelectOpen}
        open={modelSelectOpen}
        dropdownStyle={{ width: 400, left: -30 }}
        variant="borderless"
      />
    </div>
  );
});
