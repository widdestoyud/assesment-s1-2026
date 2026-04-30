import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { RegisterMemberUseCaseInterface } from '@core/use_case/mbc/RegisterMember';
import type { TopUpBalanceUseCaseInterface } from '@core/use_case/mbc/TopUpBalance';
import type { CheckInUseCaseInterface } from '@core/use_case/mbc/CheckIn';
import type { CheckOutUseCaseInterface } from '@core/use_case/mbc/CheckOut';
import type { ReadCardUseCaseInterface } from '@core/use_case/mbc/ReadCard';
import type { ManualCalculationUseCaseInterface } from '@core/use_case/mbc/ManualCalculation';
import type { ManageServiceRegistryUseCaseInterface } from '@core/use_case/mbc/ManageServiceRegistry';

import { RegisterMemberUseCase } from '@core/use_case/mbc/RegisterMember';
import { TopUpBalanceUseCase } from '@core/use_case/mbc/TopUpBalance';
import { CheckInUseCase } from '@core/use_case/mbc/CheckIn';
import { CheckOutUseCase } from '@core/use_case/mbc/CheckOut';
import { ReadCardUseCase } from '@core/use_case/mbc/ReadCard';
import { ManualCalculationUseCase } from '@core/use_case/mbc/ManualCalculation';
import { ManageServiceRegistryUseCase } from '@core/use_case/mbc/ManageServiceRegistry';

export function registerMbcUseCaseModules(container: AwilixContainer) {
  container.register({
    registerMemberUseCase: asFunction(RegisterMemberUseCase),
    topUpBalanceUseCase: asFunction(TopUpBalanceUseCase),
    checkInUseCase: asFunction(CheckInUseCase),
    checkOutUseCase: asFunction(CheckOutUseCase),
    readCardUseCase: asFunction(ReadCardUseCase),
    manualCalculationUseCase: asFunction(ManualCalculationUseCase),
    manageServiceRegistryUseCase: asFunction(ManageServiceRegistryUseCase).singleton(),
  });
}

export interface MbcUseCaseContainerInterface {
  registerMemberUseCase: RegisterMemberUseCaseInterface;
  topUpBalanceUseCase: TopUpBalanceUseCaseInterface;
  checkInUseCase: CheckInUseCaseInterface;
  checkOutUseCase: CheckOutUseCaseInterface;
  readCardUseCase: ReadCardUseCaseInterface;
  manualCalculationUseCase: ManualCalculationUseCaseInterface;
  manageServiceRegistryUseCase: ManageServiceRegistryUseCaseInterface;
}
