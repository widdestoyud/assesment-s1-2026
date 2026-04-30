import { TFunction } from 'i18next';
import { WcmsDataInterface } from '@core/services/config.service';
import type { AwilixRegistry } from '@di/container.ts';
import type { ErrorPopupInterface } from '@src/contexts/global.context';

export interface ErrorPopupScreenInterface {
  popupError: ErrorPopupInterface;
  onClose: () => void;
  t: TFunction;
  assets: WcmsDataInterface | undefined;
  defaultImage: string;
}

const ErrorPopupController = ({
  usePopupError,
  useTranslation,
  useQueryTanstack,
  configService,
  images,
}: AwilixRegistry): ErrorPopupScreenInterface => {
  const { t } = useTranslation();
  const { popupError, openPopupError } = usePopupError();

  const { data: assets } = useQueryTanstack({
    queryKey: ['web-assets'],
    queryFn: () => configService.getAssets(),
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60,
  });

  const onClose = () => {
    openPopupError({
      ...popupError,
      isOpen: false,
    });
    setTimeout(() => {
      popupError.onClose?.();
    }, 500);
  };

  return {
    popupError,
    onClose,
    t,
    assets,
    defaultImage: images.errorLogo,
  };
};

export default ErrorPopupController;
