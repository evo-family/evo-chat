import { Avatar, Badge, Button, Input, Select, SelectProps, Space, Tag, Tooltip } from 'antd';
import React, { FC, memo, useMemo, useRef, useState } from 'react';
import { EvoIcon } from '../../../icon';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { useAsyncEffect, useRequest } from 'ahooks';
import classNames from 'classnames';
import { useSenderSelector } from '../sender-processor/SenderProvider';
import { useChatWinCtx, useKnowledgeLogic } from '@evo/data-store';
import { SelectorKnowledge } from '../../../selector';

export interface IKnowledgeToolbarProps {}

export const KnowledgeToolbar: FC<IKnowledgeToolbarProps> = memo((props) => {
  const [selectValues, setSelectValues] = useState<string[]>([]);
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const knowledgeSelectOpen = useSenderSelector((s) => s.knowledgeSelectOpen);
  const setKnowledgeSelectOpen = useSenderSelector((s) => s.setKnowledgeSelectOpen);
  const senderRef = useSenderSelector((s) => s.senderRef);
  const { knowledgeList } = useKnowledgeLogic();
  // 设置默认当前选中
  useAsyncEffect(async () => {
    const ids = chatWin.getConfigState('knowledgeIds');
    setSelectValues(ids || []);
  }, [chatWin]);

  const handleChange = async (values: string[]) => {
    // 始终只取最后选择的那个值
    setSelectValues(values);
    chatWin.updateConfigKnowledgeIds(values);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tooltip
        title={
          selectValues.length > 0
            ? `已选择: ${selectValues
                .map((id) => knowledgeList?.find((k) => k.id === id)?.name)
                .filter(Boolean)
                .join('、')}`
            : '选择知识库'
        }
      >
        <Button
          className={classNames('evo-button-icon')}
          color={selectValues?.length ? 'primary' : 'default'}
          size="small"
          variant="text"
          icon={<EvoIcon size={'small'} type="icon-knowledge" />}
          onClick={() => {
            setKnowledgeSelectOpen(!knowledgeSelectOpen);
          }}
        />
      </Tooltip>
      <SelectorKnowledge
        // ref={selectRef}
        style={{ width: 0 }}
        mode="multiple"
        tagRender={() => <></>}
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
        onDropdownVisibleChange={setKnowledgeSelectOpen}
        open={knowledgeSelectOpen}
        dropdownStyle={{ width: 200, left: -30 }}
        variant="borderless"
      />
    </div>
  );
});
