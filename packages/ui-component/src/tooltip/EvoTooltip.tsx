import { Tooltip, TooltipProps } from 'antd';
import { isMobile } from '@evo/utils';


export const EvoTooltip = ((props: TooltipProps) => {
  const { children, ...otherProps } = props;
  if (isMobile()) {
    return <>{children}</>;
  }
  return <Tooltip {...otherProps}>{children}</Tooltip>;
})

