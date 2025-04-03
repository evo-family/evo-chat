import { theme } from 'antd';

const { useToken } = theme;
export const useAntdToken = () => {
  const { token, theme: t } = useToken();
  // console.log(token, t)
  return token;
};
