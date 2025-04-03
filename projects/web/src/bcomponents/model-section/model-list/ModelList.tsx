import { DrawerForm } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import { defaultModelsMap, useModelSelector } from '@evo/data-store';
import { useRequest } from 'ahooks';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { groupModelsByProvider, NativeRequest } from '@evo/utils';
import { IModelGroup } from '@evo/types';
import { SettingGroup } from '../../../components';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ModelType } from '@evo/component';

export interface IModelListProps {
}

export const ModelList: FC<IModelListProps> = props => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<IModelGroup[]>([]);

  const selectModel = useModelSelector(s => s.selectModel);
  const addSingleModel = useModelSelector(s => s.addSingleModel);
  const removeModel = useModelSelector(s => s.removeModel);
  const url = defaultModelsMap[selectModel?.id!]?.webSite?.models!;

  const { run, data } = useRequest(() => NativeRequest.get(url, {
    headers: {
      'Authorization': `Bearer ${selectModel?.apiInfo.key}`,
    }
  }), {
    manual: true,
  })

  useEffect(() => {
    if (data?.data?.data) {
      const result = groupModelsByProvider(data?.data?.data);
      setResult(result);
    }
  }, [data])

  useEffect(() => {
    if (open && url) {
      run();
    } else {
      setResult([])
    }
  }, [open, url, selectModel])



  const existModelMap = useMemo(() => {
    const modelMap = new Map<string, boolean>();
    selectModel?.groups.forEach(group => {
      group.models.forEach(model => {
        modelMap.set(model.id, true);
      });
    });
    return modelMap;
  }, [selectModel]);
  const isModelExist = (modelId: string) => existModelMap.get(modelId) || false;

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        模型列表
      </Button>
      <DrawerForm
        title="模型列表"
        width={600}
        open={open}
        drawerProps={{
          destroyOnClose: true,
          onClose: () => setOpen(false),
        }}
        submitter={{
          searchConfig: {
            submitText: '确认',
            resetText: '取消',
          },
        }}
        onFinish={async (values) => {
          setOpen(false);
          return true;
        }}
      >
        {result.map(group => (
          <SettingGroup key={group.groupName} title={group.groupName}>
            {group.models.map(model => (
              <SettingGroup.Item key={model.id} title={model.id}>
                <ModelType types={model.type} />
                {isModelExist(model.id) ? (
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const group = selectModel?.groups.find(g =>
                        g.models.some(m => m.id === model.id)
                      );
                      if (group) {
                        removeModel(group.groupName, model.id);
                      }
                    }}
                  >
                    删除
                  </Button>
                ) : (
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      addSingleModel({
                        groupName: group.groupName,
                        modelSchema: model,
                      });
                    }}
                  >
                    添加
                  </Button>
                )}
              </SettingGroup.Item>
            ))}
          </SettingGroup>
        ))}
      </DrawerForm>
    </>
  );
}

