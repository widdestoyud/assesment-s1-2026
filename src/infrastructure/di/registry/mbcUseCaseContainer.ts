import type { AwilixContainer } from 'awilix';
import { asFunction } from 'awilix';

import type { ValidateCardUseCaseInterface } from '@core/use_case/mbc/ValidateCard';
import type { TopUpBalanceUseCaseInterface } from '@core/use_case/mbc/TopUpBalance';
import type { CheckInUseCaseInterface } from '@core/use_case/mbc/CheckIn';
import type { CheckOutUseCaseInterface } from '@core/use_case/mbc/CheckOut';
import type { ReadCardUseCaseInterface } from '@core/use_case/mbc/ReadCard';

import { ValidateCardUseCase } from '@core/use_case/mbc/ValidateCard';
import { TopUpBalanceUseCase } from '@core/use_case/mbc/TopUpBalance';
import { CheckInUseCase } from '@core/use_case/mbc/CheckIn';
import { CheckOutUseCase } from '@core/use_case/mbc/CheckOut';
import { ReadCardUseCase } from '@core/use_case/mbc/ReadCard';

export function registerMbcUseCaseModules(container: AwilixContainer) {
  container.register({
    validateCardUseCase: asFunction(ValidateCardUseCase),
    topUpBalanceUseCase: asFunction(TopUpBalanceUseCase),
    checkInUseCase: asFunction(CheckInUseCase),
    checkOutUseCase: asFunction(CheckOutUseCase),
    readCardUseCase: asFunction(ReadCardUseCase),
  });
}

export interface MbcUseCaseContainerInterface {
  validateCardUseCase: ValidateCardUseCaseInterface;
  topUpBalanceUseCase: TopUpBalanceUseCaseInterface;
  checkInUseCase: CheckInUseCaseInterface;
  checkOutUseCase: CheckOutUseCaseInterface;
  readCardUseCase: ReadCardUseCaseInterface;
}
