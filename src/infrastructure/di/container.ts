import { createContainer } from 'awilix';
import {
  HelperContainerInterface,
  registerHelperModules,
} from '@di/registry/helperContainer';
import {
  LibraryContainerInterface,
  registerLibraryModule,
} from '@di/registry/libraryContainer';
import {
  MbcProtocolContainerInterface,
  registerMbcProtocolModules,
} from '@di/registry/mbcProtocolContainer';
import {
  MbcServiceContainerInterface,
  registerMbcServiceModules,
} from '@di/registry/mbcServiceContainer';
import {
  MbcUseCaseContainerInterface,
  registerMbcUseCaseModules,
} from '@di/registry/mbcUseCaseContainer';
import {
  MbcControllerContainerInterface,
  registerMbcControllerModules,
} from '@di/registry/mbcControllerContainer';

const container = createContainer<AwilixRegistry>();

registerMbcProtocolModules(container);
registerMbcServiceModules(container);
registerMbcUseCaseModules(container);
registerLibraryModule(container);
registerMbcControllerModules(container);
registerHelperModules(container);

export default container;

export type AwilixRegistry =
  HelperContainerInterface &
  LibraryContainerInterface &
  MbcControllerContainerInterface &
  MbcProtocolContainerInterface &
  MbcServiceContainerInterface &
  MbcUseCaseContainerInterface;
