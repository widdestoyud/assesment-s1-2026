import { AwilixContainer, asFunction } from 'awilix';
import { UseCaseProtocol } from '@core/protocols/use_case';
import { GetAllWebConfig } from '@core/use_case/GetAllWebConfig';

export function registerUseCaseModules(container: AwilixContainer) {
  container.register({
    getAllConfigUseCase: asFunction(GetAllWebConfig).singleton(),
  });
}

export interface UseCaseContainerInterface {
  getAllConfigUseCase: UseCaseProtocol;
}
