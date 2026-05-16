import type { FC } from 'react';
import type { ChipTransferCapabilityStatus, TranslateFn } from '../types';
import ResultStatusModal from '@components/ResultStatusModal';

export interface NfcCapabilityNoticeProps {
  status: ChipTransferCapabilityStatus;
  onClose: () => void;
  imageSrc: string;
  t: TranslateFn;
}

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status, onClose, imageSrc, t }) => {
  if (status === 'supported') return null;

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
      imageSrc={imageSrc}
      onClose={onClose}
    />
  );
};

export default NfcCapabilityNotice;
