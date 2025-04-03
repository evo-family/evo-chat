import React, { FC, memo, useMemo, useState } from 'react';
import { Avatar, Button, List, Space, theme } from 'antd';
import s from './SettingModelsPage.module.scss';
import { ModelConfig } from './model-config/ModelConfig';
import { ModelProvider, useModelSelector, useGlobalCtx } from '@evo/data-store';
import { SortableList } from '@evo/component';
import { AddModelProvider } from './add-model-provider/AddModelProvider';
import { IModel } from '@evo/types';
import { useNavigate } from 'react-router';
import { NavBar, Switch, Modal, Popup } from 'antd-mobile';

export interface IModelSetListProps {
}

export const ModelSetList: FC<IModelSetListProps> = memo((props) => {
    const navigate = useNavigate();
  const [models, setSelectModel, setModels] = useModelSelector(s => [s.models, s.setSelectModel, s.setModels])


  const [visible, setVisible] = useState(false);
  // const [modelsq,] = useGlobalCtx(ctx => ctx.modelProcessor.models);
  const [changeModelsByModel] = useModelSelector(s => [s.changeModelsByModel])


  const handleSelect = (model: IModel) => {
    if (model) {
      setSelectModel(model);
      setVisible(true);
    }
  }


  const handleSwitch = (model: IModel, checked: boolean) => {
    changeModelsByModel({
      ...model,
      enable: checked
    })
  }
  const onSort = (items: any) => {
    setModels(items);
  };

  
  return (
    <>
      <NavBar style={{color: 'var(--evo-color-text)'}} onBack={() => {navigate('/settings')}}>
        模型设置
      </NavBar>
      <div className={s.container}>
        <div className={s.modelList}>
          <SortableList
            items={models}
            onSort={onSort}
            renderItem={(model) => {
              return (
                <SortableList.Item key={model.id} className={s.sortItem} id={model.id}>
                  <div className={s.modelItem}>
                    <Space style={{color: 'var(--evo-color-text)', fontSize: 16}} >
                        <SortableList.DragHandle className={s.dragHandle} />
                    </Space>
                    <div className={s.content} onClick={() => handleSelect(model)}>
                      <Space className={s.space} style={{justifyContent: 'space-between' }}>
                        <Space style={{color: 'var(--evo-color-text)'}} >
                          <div style={{ borderRadius: 4 }}>
                            <Avatar size={'small'} src={<img src={model.logo} alt="avatar" />} />
                          </div>
                          {model.name}
                        </Space>
                        <Space onClick={(e) => e.stopPropagation()} >
                            <Switch  
                            onChange={(checked) => handleSwitch(model, checked)} 
                            checked={model.enable}
                            />
                        </Space>
                      </Space>
                    </div>
                  </div>
                </SortableList.Item>
              );
            }}
          />
           <div className={s.addModelProvider}>
            <AddModelProvider />
          </div>
        </div>
      </div>

      <Popup
        visible={visible}
        onClose={() => {
            setVisible(false)
          }}
        position='right'
        showCloseButton
        bodyStyle={{
          width: '100vw', 
          height: '100vh',
          padding: 0,
          overflow: 'auto' 
        }}
      >
        <div className={s.popupContainer}>
          <div className={s.popupHeader}>
            <NavBar 
              style={{color: 'var(--evo-color-text)'}} 
              back={null}
            //   onBack={() => setVisible(false)}
            >
              模型设置
            </NavBar>
          </div>
          <div className={s.popupContent}>
            <ModelConfig />
          </div>
        </div>
      </Popup>

    </>
  );
})



export interface ISettingModelsPageProps {
}

export const SettingModelsPage: FC<ISettingModelsPageProps> = memo(() => {
  return <>
    <ModelProvider>
      <ModelSetList />
    </ModelProvider>
  </>
});




