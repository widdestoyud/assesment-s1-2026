import styles from '@pages/PopupError/popup-error.module.scss';
import { WcmsDataInterface } from '@core/services/config.service.ts';
import awilix from '@di/container';
import { ErrorPopupScreenInterface } from '@controllers/error-popup.controller';
import Button from '@components/Button';
import ResponsiveDialog from '@components/ResponsiveDialog';

const PopupError = () => {
  const { popupError, onClose, assets, defaultImage } =
    awilix.resolve<ErrorPopupScreenInterface>('errorPopupController');

  return (
    <ResponsiveDialog
      isOpen={popupError.isOpen}
      footer={
        popupError?.closeLabel ? (
          <Button
            data-testid="register-button"
            variant="primary"
            rounded={true}
            width="full"
            onClick={onClose}
          >
            {popupError.closeLabel}
          </Button>
        ) : null
      }
      onClose={onClose}
    >
      <div className={styles.popupErrorWrapper}>
        <img
          className={styles.popupErrorImage}
          src={
            assets?.[popupError?.image as keyof WcmsDataInterface] ??
            defaultImage
          }
          alt="pop-up-error-image"
        />
        <div className={styles.popupErrorTitle}>{popupError.title}</div>
        <div className={styles.popupErrorMsg}>{popupError.message}</div>
      </div>
    </ResponsiveDialog>
  );
};

export default PopupError;
