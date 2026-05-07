import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { PricingServiceInterface } from '@core/services/mbc/pricing.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';

import { PricingService } from '@core/services/mbc/pricing.service';
import { CardDataService } from '@core/services/mbc/card-data.service';
import { SilentShieldService } from '@core/services/mbc/silent-shield.service';
import { NfcService } from '@core/services/mbc/nfc.service';

export function registerMbcServiceModules(container: AwilixContainer) {
  container.register({
    pricingService: asFunction(PricingService),
    cardDataService: asFunction(CardDataService),
    silentShieldService: asFunction(SilentShieldService),
    nfcService: asFunction(NfcService).singleton(),
  });
}

export interface MbcServiceContainerInterface {
  pricingService: PricingServiceInterface;
  cardDataService: CardDataServiceInterface;
  silentShieldService: SilentShieldServiceInterface;
  nfcService: NfcServiceInterface;
}
