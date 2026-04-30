import { useNavigate } from '@tanstack/react-router';
import i18n from 'i18next';
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CheckStatusResponseInterface } from '@core/services/registration.service';
import GlobalContext, {
  ErrorPopupInterface,
} from '@src/contexts/global.context';
import images from '@src/infrastructure/images';
import { Route } from '@routes/__root';
import { normalizeLang } from '@utils/helpers/string.helper';

const GlobalProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t } = i18n;
  const navigate = useNavigate();
  const persistIsIframe = !!localStorage.getItem('isIframe');
  let defLang = normalizeLang(i18n.language).toLowerCase();
  if (defLang !== 'id' && defLang !== 'en') {
    defLang = 'en';
  }

  const { isMobile } = Route.useSearch();

  const [loading, setLoading] = useState<boolean>(true);
  const [isIframe, setIsIframe] = useState<boolean>(persistIsIframe ?? false);
  const [activeLng, setActiveLng] = useState(defLang);
  const [detailStatus, setDetailStatus] = useState<
    CheckStatusResponseInterface | undefined
  >(undefined);
  const [popupError, setPopupError] = useState<ErrorPopupInterface>({
    isOpen: false,
    title: '',
    message: '',
  });

  const toggleLoading = useCallback(
    () => setLoading(prevState => !prevState),
    []
  );

  const setDetailData = useCallback(
    (data: CheckStatusResponseInterface) => setDetailStatus(data),
    []
  );

  const setLng = useCallback((lng: string) => setActiveLng(lng), []);

  const openPopupError = useCallback((error: ErrorPopupInterface) => {
    const { isOpen, title, message, image, closeLabel, onClose } = error;
    const errorData: ErrorPopupInterface = {
      isOpen: isOpen,
      title: title ?? t('app_popup_error_title'),
      message: message ?? t('app_popup_error_message'),
      image: image ?? images.errorLogo,
      closeLabel: closeLabel ?? t('app_popup_close_button_label'),
      onClose: onClose ?? undefined,
    };
    setPopupError(errorData);
  }, []);

  /**
   * Redirect if isMobile or load in iframe detected
   */
  useEffect(() => {
    if (
      window.location !== window.parent.location ||
      isMobile ||
      persistIsIframe
    ) {
      setIsIframe(true);
      localStorage.setItem('isIframe', 'true');
      setTimeout(() => {
        navigate({
          to: '/landing-page',
          viewTransition: true,
        });
      }, 800);
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const contextValue = useMemo(
    () => ({
      isIframe,
      detailStatus,
      setDetailData,
      loading,
      toggleLoading,
      lng: activeLng,
      setLng,
      popupError,
      openPopupError,
    }),
    [
      isIframe,
      detailStatus,
      setDetailData,
      loading,
      toggleLoading,
      activeLng,
      setLng,
      popupError,
      openPopupError,
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
