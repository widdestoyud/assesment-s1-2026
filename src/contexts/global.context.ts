import { createContext } from 'react';
import type { CheckStatusResponseInterface } from '@core/services/registration.service';

export interface ErrorPopupInterface {
  isOpen: boolean;
  title?: string;
  message?: string;
  image?: string;
  onClose?: () => void;
  closeLabel?: string;
}

export interface GlobalContextInterface {
  isIframe: boolean;
  detailStatus?: CheckStatusResponseInterface;
  setDetailData: (data: CheckStatusResponseInterface) => void;
  loading: boolean;
  toggleLoading: () => void;
  lng: string;
  setLng: (lng: string) => void;
  popupError: ErrorPopupInterface;
  openPopupError: (error: ErrorPopupInterface) => void;
}

const GlobalContext = createContext<GlobalContextInterface>({
  isIframe: false,
  detailStatus: undefined,
  setDetailData: () => {},
  loading: false,
  toggleLoading: () => {},
  lng: '',
  setLng: () => {},
  popupError: {
    isOpen: false,
  },
  openPopupError: () => {},
});

export default GlobalContext;
