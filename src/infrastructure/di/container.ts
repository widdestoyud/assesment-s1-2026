import { createContainer } from 'awilix';
import {
  ControllerContainerInterface,
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
  ServiceContainerInterface,
  registerServiceModules,
} from '@di/registry/serviceContainer';
import {
  TanstackContainerInterface,
  registerTanstackModule,
} from '@di/registry/tanstackContainer';
import {
  UseCaseContainerInterface,
  registerUseCaseModules,
} from '@di/registry/useCaseContainer';

const container = createContainer<AwilixRegistry>();

registerProtocolModules(container);
registerServiceModules(container);
registerTanstackModule(container);
registerUseCaseModules(container);
registerLibraryModule(container);
registerControllerModules(container);
registerReactModules(container);
registerHelperModules(container);

export default container;

export type AwilixRegistry = ControllerContainerInterface &
  HelperContainerInterface &
  LibraryContainerInterface &
  ProtocolContainerInterface &
  ReactContainerInterface &
  ServiceContainerInterface &
  TanstackContainerInterface &
  UseCaseContainerInterface;
