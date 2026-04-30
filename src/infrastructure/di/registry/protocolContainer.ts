import { AwilixContainer, asFunction, asValue } from 'awilix';
import { HttpProtocol } from '@core/protocols/http';
import { LocalStorageProtocol } from '@core/protocols/storage';
import axiosAdapter from '@src/infrastructure/http/axiosAdapter';
import { webStorageAdapter } from '@src/infrastructure/storage/webStorageAdapter';
import { requestInterceptor } from '@utils/interceptors/requestInterceptor';

export function registerProtocolModules(container: AwilixContainer) {
  container.register({
    http: asFunction(axiosAdapter).inject(() => ({
      requestInterceptor: requestInterceptor,
      refreshInterceptor: undefined,
    })),
    localStorage: asValue(webStorageAdapter),
  });
}

export interface ProtocolContainerInterface {
  http: HttpProtocol;
  localStorage: LocalStorageProtocol;
}
