import { AwilixContainer, asFunction } from 'awilix';
import ErrorPopupController, {
  ErrorPopupScreenInterface,
} from '@controllers/error-popup.controller';
import LoadingController, {
  LoadingControllerInterface,
} from '@controllers/loading.controller';
import NavbarController, {
  NavbarControllerInterface,
} from '@controllers/navbar.controller';
import SplashController, {
  SplashControllerInterface,
} from '@controllers/splash.controller';

export function registerControllerModules(container: AwilixContainer) {
  container.register({
    navbarController: asFunction(NavbarController),
    splashController: asFunction(SplashController),
    loadingController: asFunction(LoadingController),
    errorPopupController: asFunction(ErrorPopupController),
  });
}

export interface ControllerContainerInterface {
  navbarController: NavbarControllerInterface;
  splashController: SplashControllerInterface;
  loadingController: LoadingControllerInterface;
  errorPopupController: ErrorPopupScreenInterface;
}
