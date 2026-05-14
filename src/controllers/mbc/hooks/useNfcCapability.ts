import type { AwilixRegistry } from '@di/container';
import type { NfcCapabilityStatus } from '@src/@core/models/mbc';

export interface UseNfcCapabilityReturn {
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
}

export const useNfcCapability = (
  deps: Pick<AwilixRegistry, 'useState' | 'useEffect' | 'nfcService'>,
): UseNfcCapabilityReturn => {
  const { useState, useEffect, nfcService } = deps;
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isAvailable = nfcService.isAvailable();
    setNfcCapability(isAvailable ? 'supported' : 'unsupported');
  }, []);

  const nfcAvailable = nfcCapability === 'supported' || nfcCapability === 'permission_pending';

  return { nfcCapability, nfcAvailable };
};
