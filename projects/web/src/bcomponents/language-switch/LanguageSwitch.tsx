import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

export const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onChange={(value) => i18n.changeLanguage(value)}
      options={[
        { label: '自动', value: 'auto' },
        { label: '中文', value: 'zh' },
        { label: 'English', value: 'en' },
      ]}
    />
  );
};

export default LanguageSwitch;
