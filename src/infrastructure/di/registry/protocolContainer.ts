import { AwilixContainer, asValue } from 'awilix';
import { LocalStorageProtocol } from '@core/protocols/storage';
import { webStorageAdapter } from '@src/infrastructure/storage/webStorageAdapter';

export function registerProtocolModules(container: AwilixContainer) {
  container.register({
    localStorage: asValue(webStorageAdapter),
  });
}

export interface ProtocolContainerInterface {
  localStorage: LocalStorageProtocol;
}
