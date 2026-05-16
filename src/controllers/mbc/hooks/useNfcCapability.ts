import { useState, useEffect } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { ChipTransferCapabilityStatus } from '@src/@core/models/mbc';

export interface UseChipTransferCapabilityReturn {
  chipTransferCapability: ChipTransferCapabilityStatus;
  chipTransferAvailable: boolean;
}

export const useChipTransferCapability = (
  deps: Pick<AwilixRegistry, 'chipTransferService'>,
): UseChipTransferCapabilityReturn => {
  const { chipTransferService } = deps;
  const [chipTransferCapability, setChipTransferCapability] = useState<ChipTransferCapabilityStatus>('permission_pending');

  useEffect(() => {
    if (!chipTransferService.isAvailable()) {
      setChipTransferCapability('unsupported');
      return;
    }

    chipTransferService.queryPermission((status) => {
      setChipTransferCapability(status);
    }).then((status) => {
      setChipTransferCapability(status);
    }).catch(() => {
      setChipTransferCapability('permission_pending');
    });
  }, []);

  const chipTransferAvailable = chipTransferCapability === 'supported' || chipTransferCapability === 'permission_pending';

  return { chipTransferCapability, chipTransferAvailable };
};
