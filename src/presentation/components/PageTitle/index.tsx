import { FC, PropsWithChildren } from 'react';

const PageTitle: FC<PropsWithChildren> = ({ children }) => {
  return <h1>{children}</h1>;
};

export default PageTitle;
