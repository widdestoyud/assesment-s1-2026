import { FC, HTMLAttributes } from 'react';
import styles from '@components/Loading/loading.module.scss';
import loader from '@images/loader.svg';

const Loading: FC<HTMLAttributes<HTMLImageElement>> = props => {
  const { className, ...others } = props;
  return (
    <img
      className={[styles.loader, className].join(' ')}
      src={loader}
      alt="MyTelkomsel Loading"
      {...others}
    />
  );
};

export default Loading;
