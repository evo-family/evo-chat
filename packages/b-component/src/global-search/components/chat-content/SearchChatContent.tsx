import React, { useLayoutEffect } from 'react';

import { FlexFillContent } from '../../../flexable/flex-fill-content/FlexFillContent';
import { ISearchChatContentProps } from './types';
import { SearchChatContentList } from './SearchResult';
import { useGlobSearchCtx } from '../../context/SearchContext';
import { useSearchChatContent } from '@evo/data-store';

export const SearchChatContent = React.memo<ISearchChatContentProps>((props) => {
  const [keywords] = useGlobSearchCtx((ctx) => ctx.keywords);

  const { searchResult, searchChatConent } = useSearchChatContent();

  useLayoutEffect(() => {
    searchChatConent({ keywords });
  }, [keywords]);

  return (
    <FlexFillContent>
      <SearchChatContentList searchResult={searchResult} />
    </FlexFillContent>
  );
});
