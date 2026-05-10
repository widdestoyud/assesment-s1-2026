import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { NfcCapabilityStatus } from '@src/@core/models/mbc';
import { useNavigate } from '@tanstack/react-router';
import ResultStatusModal from '@components/ResultStatusModal';
import images from '@infra/images';

export interface NfcCapabilityNoticeProps {
  status: NfcCapabilityStatus;
  t: TFunction;
}

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status, t }) => {
  const navigate = useNavigate();

  if (status === 'supported') return null;

  const handleClose = () => {
    navigate({ to: '/' });
  };

  const getContent = () => {
    switch (status) {
      case 'unsupported':
        return {
          title: t('mbc_nfc_unsupported_title'),
          message: t('mbc_nfc_unsupported_message'),
        };
      case 'permission_pending':
        return {
          title: t('mbc_nfc_permission_pending_title'),
          message: t('mbc_nfc_permission_pending_message'),
        };
      case 'permission_denied':
        return {
          title: t('mbc_nfc_permission_denied_title'),
          message: t('mbc_nfc_permission_denied_message'),
        };
    }
  };

  const content = getContent();

  return (
    <ResultStatusModal
      isOpen={true}
      variant="error"
      title={content.title}
      subtitle={content.message}
      buttonLabel={t('app_popup_close_button_label')}
      imageSrc={images.nfcFailed}
      onClose={handleClose}
      t={t}
    />
  );
};

export default NfcCapabilityNotice;
