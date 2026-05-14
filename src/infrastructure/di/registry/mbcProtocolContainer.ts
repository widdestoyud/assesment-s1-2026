import type { AwilixContainer } from 'awilix';
import { asValue } from 'awilix';

import type { ChipTransferProtocol } from '@core/protocols/chip-transfer';
import { webNfcAdapter } from '@src/infrastructure/nfc/webNfcAdapter';

export function registerMbcProtocolModules(container: AwilixContainer) {
  container.register({
    chipTransferProtocol: asValue(webNfcAdapter),
  });
}

export interface MbcProtocolContainerInterface {
  chipTransferProtocol: ChipTransferProtocol;
}
