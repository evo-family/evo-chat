import { ECollectionLayoutType, ICollectionLayoutProps } from './types';
import { memo, useState } from 'react';

import Style from './Style.module.scss';
import cxb from 'classnames/bind';

const cx = cxb.bind(Style);

const LAYOUT_CLASS_NAME_MAPPING: Record<ECollectionLayoutType, string> = {
  [ECollectionLayoutType.horizontalScroll]: cx('horizontal-scroll'),
};

export const CollectionLayout = memo(<T,>(props: ICollectionLayoutProps<T>) => {
  const { data, itemRender, itemClassName } = props;
  const [layoutType, setLayoutType] = useState(ECollectionLayoutType.horizontalScroll);

  return (
    <div className={cx(['collection-layout', LAYOUT_CLASS_NAME_MAPPING[layoutType]])}>
      {data.map((item, index) => (
        <div key={index} className={cx('collection-layout-item', itemClassName)}>
          {itemRender(item, index)}
        </div>
      ))}
    </div>
  );
}) as <T>(props: ICollectionLayoutProps<T>) => JSX.Element;
