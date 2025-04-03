import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useTabBar } from '../../hooks/useTabBar';

export const TabBarLayout = () => {
  // const { pathname } = useLocation();
  // const { showTabBar, hideTabBar } = useTabBar();

  // useEffect(() => {
  //   const showTabRoutes = ['/home', '/assistant', '/knowledge', '/file', '/settings'];
  //   // console.debug('todo 待调试 ===== showTabBar pathname: ', pathname);
  //   if (showTabRoutes.includes(pathname)) {
  //     showTabBar();
  //   } else {
  //     hideTabBar();
  //   }
  // }, [pathname]);

  return <Outlet />;
};