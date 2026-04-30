import { AwilixContainer, asValue } from 'awilix';
import helpers from '@utils/helpers';
import { UseDialogReturn, useDialogHook } from '@utils/hooks/use-dialog.hook';
import useIframe, { UseIframeInterface } from '@utils/hooks/use-iframe.hook';
import { UseLngInterface, useLng } from '@utils/hooks/use-lng.hook';
import useLoading, { UseLoadingInterface } from '@utils/hooks/use-loading.hook';
import {
  UseNavigationInterface,
  useNavigationHook,
} from '@utils/hooks/use-navigation.hook';
import usePopupError, {
  UsePopupErrorInterface,
} from '@utils/hooks/use-popup-error.hook';

export function registerHelperModules(container: AwilixContainer) {
  container.register({
    helpers: asValue(helpers),
    useLoading: asValue(useLoading),
    useDialog: asValue(useDialogHook),
    useNavigation: asValue(useNavigationHook),
    useIframe: asValue(useIframe),
    useLng: asValue(useLng),
    usePopupError: asValue(usePopupError),
  });
}

export interface HelperContainerInterface {
  helpers: typeof helpers;
  useLoading: () => UseLoadingInterface;
  useDialog: () => UseDialogReturn;
  useNavigation: () => UseNavigationInterface;
  useIframe: () => UseIframeInterface;
  useLng: () => UseLngInterface;
  usePopupError: () => UsePopupErrorInterface;
}
