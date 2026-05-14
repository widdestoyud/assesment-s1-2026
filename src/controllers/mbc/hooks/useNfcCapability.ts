import type { AwilixRegistry } from '@di/container';
import type { ChipTransferCapabilityStatus } from '@src/@core/models/mbc';

export interface UseChipTransferCapabilityReturn {
  chipTransferCapability: ChipTransferCapabilityStatus;
  chipTransferAvailable: boolean;
}

export const useChipTransferCapability = (
  deps: Pick<AwilixRegistry, 'useState' | 'useEffect' | 'chipTransferService'>,
): UseChipTransferCapabilityReturn => {
  const { useState, useEffect, chipTransferService } = deps;
  const [chipTransferCapability, setChipTransferCapability] = useState<ChipTransferCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isAvailable = chipTransferService.isAvailable();
    setChipTransferCapability(isAvailable ? 'supported' : 'unsupported');
  }, []);

  const chipTransferAvailable = chipTransferCapability === 'supported' || chipTransferCapability === 'permission_pending';

  return { chipTransferCapability, chipTransferAvailable };
};
