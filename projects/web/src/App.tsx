import './i18n';
import 'antd/dist/reset.css';
import './styles/index.scss';
import './App.css';
import './bootStrap';

import { RouterProvider } from 'react-router';

import { router } from './routers';
import { WrapperProvider } from '@evo/component';

const App = () => {
  return (
    <WrapperProvider>
      <RouterProvider router={router} />
    </WrapperProvider>
  );
};

export default App;
