export enum ECollectionLayoutType {
  horizontalScroll = 'horizontalScroll',
}

export interface ICollectionLayoutProps<T> {
  data: Array<T>;
  itemRender: (item: T, index: number) => JSX.Element;
  itemClassName?: string;
}
