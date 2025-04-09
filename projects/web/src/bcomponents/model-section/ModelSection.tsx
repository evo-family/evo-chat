import React, { FC, memo, useMemo, useState } from 'react';
import { Avatar, Button, Divider, Flex, List, Space, Switch, theme } from 'antd';
import s from './ModelSection.module.scss';
import { ModelConfig } from './model-config/ModelConfig';
import { ModelProvider, useModelSelector, useGlobalCtx } from '@evo/data-store';
import { SortableList, useAntdToken } from '@evo/component';
import { AddModelProvider } from './add-model-provider/AddModelProvider';
import { IModel } from '@evo/types';
import classNames from 'classnames';

export interface IModelSelectionContentProps {}

export const ModelSelectionContent: FC<IModelSelectionContentProps> = memo((props) => {
  const [models, setSelectModel, selectModel, setModels] = useModelSelector((s) => [
    s.models,
    s.setSelectModel,
    s.selectModel,
    s.setModels,
  ]);

  const [changeModelsByModel] = useModelSelector((s) => [s.changeModelsByModel]);

  const handleSelect = (model: IModel) => {
    if (model) {
      setSelectModel(model);
    }
  };

  const handleSwitch = (model: IModel, checked: boolean) => {
    changeModelsByModel({
      ...model,
      enable: checked,
    });
  };
  const onSort = (items: any) => {
    setModels(items);
  };

  return (
    <div className={s.container}>
      <div className={s.modelList}>
        <Flex gap="middle" vertical style={{ height: '100%' }}>
          <SortableList
            items={models}
            onSort={onSort}
            renderItem={(model) => {
              return (
                <SortableList.Item key={model.id} className={s.sortItem} id={model.id}>
                  <div
                    className={classNames(s.modelItem, {
                      [s.active]: model.id === selectModel?.id,
                    })}
                  >
                    <SortableList.DragHandle className={s.dragHandle} />
                    <div className={s.content} onClick={() => handleSelect(model)}>
                      <div className={s.item}>
                        <Avatar size={'small'} src={<img src={model.logo} alt="avatar" />} />
                        <div className={s.label}>{model.name}</div>
                        <Switch
                          size="small"
                          onChange={(checked) => handleSwitch(model, checked)}
                          checked={model.enable}
                        ></Switch>
                      </div>
                    </div>
                  </div>
                </SortableList.Item>
              );
            }}
          />
          <AddModelProvider />
        </Flex>
      </div>
      <div className={s.configArea}>
        <ModelConfig />
      </div>
    </div>
  );
});

export interface IModelSectionProps {}

export const ModelSection: FC<IModelSectionProps> = memo(() => {
  return (
    <>
      <ModelProvider>
        <ModelSelectionContent />
      </ModelProvider>
    </>
  );
});
