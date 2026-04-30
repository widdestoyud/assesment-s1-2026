import { AwilixContainer, asFunction } from 'awilix';
import {
  ConfigService,
  ConfigServiceInterface,
} from '@core/services/config.service';
import {
  MsisdnService,
  MsisdnServiceInterface,
} from '@core/services/msisdn.service';
import {
  RegistrationService,
  RegistrationServiceInterface,
} from '@core/services/registration.service';

export function registerServiceModules(container: AwilixContainer) {
  container.register({
    configService: asFunction(ConfigService).singleton(),
    msisdnService: asFunction(MsisdnService).singleton(),
    registrationService: asFunction(RegistrationService).singleton(),
  });
}

export interface ServiceContainerInterface {
  configService: ConfigServiceInterface;
  msisdnService: MsisdnServiceInterface;
  registrationService: RegistrationServiceInterface;
}
