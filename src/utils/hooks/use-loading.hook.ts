import { useContext } from 'react';
import GlobalContext from '@src/contexts/global.context';

export interface UseLoadingInterface {
  loading: boolean;
  toggleLoading: () => void;
}

const useLoading = (): UseLoadingInterface => {
  const context = useContext(GlobalContext);
  return {
    loading: context?.loading ?? false,
    toggleLoading: context?.toggleLoading,
  };
};

export default useLoading;
