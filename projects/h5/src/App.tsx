import './App.css';
import './config/config';
import './bootStrap';

import { RouterProvider } from 'react-router';

import { router } from './routers';
import { AntMobileProvider } from './provider/AntMobileProvider';
import { WrapperProvider } from '@evo/component';

const App = () => {
  return (
    <>
      <WrapperProvider>
        <AntMobileProvider>
          <RouterProvider router={router} />
        </AntMobileProvider>
      </WrapperProvider>
    </>
  );
};

export default App;
