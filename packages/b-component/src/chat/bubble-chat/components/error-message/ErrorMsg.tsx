import React from 'react';
import Style from './Style.module.scss';

export interface IErrorMessageProps {
  text: string;
}

export const ErrorMessage = React.memo<IErrorMessageProps>((props) => {
  return <div className={Style.container}>{props.text}</div>;
});
