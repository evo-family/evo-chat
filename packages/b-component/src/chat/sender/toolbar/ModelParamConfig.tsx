import { Button, Card, Divider, Dropdown, Flex, InputNumber, Slider, Space, Tooltip } from 'antd';
import React, { FC } from 'react';
import { SettingPanel, SettingPanelItem } from '../../../setting-panel';
import { defaultModelParamsConfig, useGlobalCtx } from '@evo/data-store';

import { EvoIcon } from '../../../icon';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import s from './ModelParamConfig.module.scss';
import { useAntdToken } from '../../../hooks';
import { useMemoizedFn } from 'ahooks';

export interface IModelParamConfigProps {}
export const ModelParamConfig: FC<IModelParamConfigProps> = React.memo((props) => {
  const [modelParams] = useGlobalCtx((s) => s.modelProcessor.modelParams);
  const [updateModelParams] = useGlobalCtx((s) => s.modelProcessor.updateModelParams);

  const handleChange = (value: number, key: keyof typeof modelParams) => {
    updateModelParams({ [key]: value });
  };
  const token = useAntdToken();

  const dropdownRender = () => {
    return (
      <div className="ant-dropdown-menu">
        <Card
          className={s.paramCard}
          size="small"
          title="模型参数设置"
          bordered={false}
          style={{
            boxShadow: 'none',
            background: 'transparent',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {defaultModelParamsConfig.map((item) => {
              const key = item.key as keyof typeof modelParams;
              const value = modelParams?.[key];
              return (
                <div className={s.paramItem}>
                  <div className={s.label}>
                    <span>
                      {item.name}
                      <Tooltip title={item.tips}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </span>
                    <span className={s.desc}>{item.key}</span>
                  </div>
                  <div className={s.control}>
                    <Slider
                      style={{ flex: 1 }}
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={value}
                      onChange={(v) => {
                        handleChange(v as number, key);
                      }}
                    />
                    <InputNumber
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={value}
                      onChange={(v) => {
                        handleChange(v as number, key);
                      }}
                      // defaultValue={item.value}
                      style={{ width: 70, marginLeft: 12 }}
                    />
                  </div>
                </div>
              );
            })}
          </Space>
        </Card>
      </div>
    );
  };

  const dropdownRender2 = useMemoizedFn(() => {
    return (
      <SettingPanel title="模型参数设置" style={{ width: 400 }} className="ant-dropdown-menu">
        {defaultModelParamsConfig.map((item) => {
          const key = item.key as keyof typeof modelParams;
          const value = modelParams?.[key];
          return (
            <div key={key}>
              <Divider style={{ margin: '5px 0px' }} orientationMargin={13} />
              <SettingPanelItem
                title={item.name}
                titleSize="small"
                tips={item.tips}
                direction="horizontal"
              >
                <span style={{ color: token.colorTextTertiary }}>{item.key}</span>
              </SettingPanelItem>
              <SettingPanelItem>
                <Flex gap="middle" align="center" style={{}}>
                  <Slider
                    style={{ flex: 1 }}
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={value}
                    onChange={(v) => {
                      handleChange(v as number, key);
                    }}
                  />
                  <InputNumber
                    // size='small'
                    size="small"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={value}
                    onChange={(v) => {
                      handleChange(v as number, key);
                    }}
                    // defaultValue={item.value}
                    style={{ width: 70, height: '24px' }}
                  />
                </Flex>
              </SettingPanelItem>
            </div>
          );
        })}
      </SettingPanel>
    );
  });

  return (
    <>
      <Dropdown trigger={['click']} dropdownRender={dropdownRender2}>
        <Tooltip title="模型参数设置">
          <Button
            className={classNames('evo-button-icon')}
            size="small"
            type="text"
            icon={<SettingOutlined />}
          />
        </Tooltip>
      </Dropdown>
    </>
  );
});
