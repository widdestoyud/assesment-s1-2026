import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { PricingServiceInterface } from '@core/services/mbc/pricing.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { DeviceServiceInterface } from '@core/services/mbc/device.service';
import type { StorageHealthServiceInterface } from '@core/services/mbc/storage-health.service';
import type { ServiceRegistryServiceInterface } from '@core/services/mbc/service-registry.service';

import { PricingService } from '@core/services/mbc/pricing.service';
import { CardDataService } from '@core/services/mbc/card-data.service';
import { SilentShieldService } from '@core/services/mbc/silent-shield.service';
import { NfcService } from '@core/services/mbc/nfc.service';
import { DeviceService } from '@core/services/mbc/device.service';
import { StorageHealthService } from '@core/services/mbc/storage-health.service';
import { ServiceRegistryService } from '@core/services/mbc/service-registry.service';

export function registerMbcServiceModules(container: AwilixContainer) {
  container.register({
    // Layer 1 — Pure logic services (stateless)
    pricingService: asFunction(PricingService),
    cardDataService: asFunction(CardDataService),
    silentShieldService: asFunction(SilentShieldService),

    // Layer 3 — Stateful services (singleton for shared state)
    nfcService: asFunction(NfcService).singleton(),
    deviceService: asFunction(DeviceService).singleton(),
    storageHealthService: asFunction(StorageHealthService).singleton(),
    serviceRegistryService: asFunction(ServiceRegistryService).singleton(),
  });
}

export interface MbcServiceContainerInterface {
  pricingService: PricingServiceInterface;
  cardDataService: CardDataServiceInterface;
  silentShieldService: SilentShieldServiceInterface;
  nfcService: NfcServiceInterface;
  deviceService: DeviceServiceInterface;
  storageHealthService: StorageHealthServiceInterface;
  serviceRegistryService: ServiceRegistryServiceInterface;
}
