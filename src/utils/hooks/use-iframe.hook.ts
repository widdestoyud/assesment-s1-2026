import { useContext } from 'react';
import GlobalContext from '@src/contexts/global.context';

export interface UseIframeInterface {
  isIframe: boolean;
}

const useIframe = () => {
  const context = useContext(GlobalContext);
  return {
    isIframe: context?.isIframe ?? false,
  };
};

export default useIframe;
