import { createContainer } from 'awilix';
import {
  registerControllerModules,
} from '@di/registry/controllerContainer';
import {
  HelperContainerInterface,
  registerHelperModules,
} from '@di/registry/helperContainer';
import {
  LibraryContainerInterface,
  registerLibraryModule,
} from '@di/registry/libraryContainer';
import {
  ProtocolContainerInterface,
  registerProtocolModules,
} from '@di/registry/protocolContainer';
import {
  ReactContainerInterface,
  registerReactModules,
} from '@di/registry/reactContainer';
import {
  registerServiceModules,
} from '@di/registry/serviceContainer';
import {
  registerTanstackModule,
} from '@di/registry/tanstackContainer';
import {
  registerUseCaseModules,
} from '@di/registry/useCaseContainer';
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

registerProtocolModules(container);
registerMbcProtocolModules(container);
registerServiceModules(container);
registerMbcServiceModules(container);
registerTanstackModule(container);
registerUseCaseModules(container);
registerMbcUseCaseModules(container);
registerLibraryModule(container);
registerControllerModules(container);
registerMbcControllerModules(container);
registerReactModules(container);
registerHelperModules(container);

export default container;

export type AwilixRegistry =
  HelperContainerInterface &
  LibraryContainerInterface &
  MbcControllerContainerInterface &
  MbcProtocolContainerInterface &
  MbcServiceContainerInterface &
  MbcUseCaseContainerInterface &
  ProtocolContainerInterface &
  ReactContainerInterface;
