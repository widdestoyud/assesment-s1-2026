import { AwilixContainer, asValue } from 'awilix';
import type { KeyValueStoreProtocol } from '@core/protocols/key-value-store';
import { webStorageAdapter } from '@src/infrastructure/storage/webStorageAdapter';

export function registerProtocolModules(container: AwilixContainer) {
  container.register({
    keyValueStore: asValue(webStorageAdapter),
  });
}

export interface ProtocolContainerInterface {
  keyValueStore: KeyValueStoreProtocol;
}
