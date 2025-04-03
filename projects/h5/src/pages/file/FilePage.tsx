import React, { FC } from 'react';
import s from './FilePage.module.scss';

export interface IFilePageProps {}

export const FilePage: FC<IFilePageProps> = () => {
  return (
    <div className={s.page}>
      文件页面
    </div>
  );
};