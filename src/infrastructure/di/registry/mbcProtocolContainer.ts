import type { AwilixContainer } from 'awilix';
import { asValue } from 'awilix';

import type { NfcProtocol } from '@core/protocols/nfc';
import { webNfcAdapter } from '@src/infrastructure/nfc/webNfcAdapter';

export function registerMbcProtocolModules(container: AwilixContainer) {
  container.register({
    nfcProtocol: asValue(webNfcAdapter),
  });
}

export interface MbcProtocolContainerInterface {
  nfcProtocol: NfcProtocol;
}
