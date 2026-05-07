import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export interface ScoutControllerInterface {
  nfcStatus: NfcStatus;
  cardData: CardData | null;
  rawEncryptedBase64: string | null;
  rawDecryptedJson: string | null;
  isReading: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onReadCard: () => Promise<void>;
  t: TFunction;
}

const ScoutController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'readCardUseCase'
    | 'nfcService'
    | 'silentShieldService'
    | 'cardDataService'
  >,
): ScoutControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    nfcService,
    silentShieldService,
    cardDataService,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [rawEncryptedBase64, setRawEncryptedBase64] = useState<string | null>(null);
  const [rawDecryptedJson, setRawDecryptedJson] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCodePoint(byte);
    }
    return btoa(binary);
  };

  const onReadCard = async () => {
    if (isReading) return;
    setIsReading(true);
    setNfcStatus('scanning');
    setError(null);
    setCardData(null);
    setRawEncryptedBase64(null);
    setRawDecryptedJson(null);

    try {
      // Step 1: Read raw bytes from card
      const rawEncrypted = await nfcService.readCard();

      // Store encrypted raw data
      if (rawEncrypted.length > 0) {
        setRawEncryptedBase64(uint8ToBase64(rawEncrypted));
      }

      // Step 2: Try to decrypt
      const decrypted = await silentShieldService.decrypt(rawEncrypted);

      // Store decrypted raw data
      const decoder = new TextDecoder();
      setRawDecryptedJson(decoder.decode(decrypted));

      // Step 3: Try to deserialize
      const card = cardDataService.deserialize(decrypted);

      setNfcStatus('success');
      setCardData(card);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsReading(false);
    }
  };

  return {
    nfcStatus,
    cardData,
    rawEncryptedBase64,
    rawDecryptedJson,
    isReading,
    error,
    nfcCapability,
    onReadCard,
    t,
  };
};

export default ScoutController;
