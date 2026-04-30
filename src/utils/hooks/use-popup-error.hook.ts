import { useContext } from 'react';
import GlobalContext, {
  ErrorPopupInterface,
} from '@src/contexts/global.context';

export interface UsePopupErrorInterface {
  popupError: ErrorPopupInterface;
  openPopupError: (error: ErrorPopupInterface) => void;
}

const usePopupError = (): UsePopupErrorInterface => {
  const context = useContext(GlobalContext);
  return {
    popupError: context?.popupError,
    openPopupError: context?.openPopupError,
  };
};

export default usePopupError;
