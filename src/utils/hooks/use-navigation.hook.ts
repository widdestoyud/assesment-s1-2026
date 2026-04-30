import {
  RouterHistory,
  UseNavigateResult,
  useNavigate,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router';

export interface UseNavigationInterface {
  goBack: () => void;
  navigate: UseNavigateResult<'/prepaid-registration'>;
  history: RouterHistory;
}

export const useNavigationHook = (): UseNavigationInterface => {
  const basePath = useRouteContext({
    from: '__root__',
    select: context => context.basePath,
  }) as '/prepaid-registration';
  const navigate = useNavigate({ from: basePath });
  const { history } = useRouter();

  const goBack = () => {
    if (history.canGoBack()) {
      history.back();
    } else {
      navigate({
        to: 'landing-page',
        viewTransition: true,
      });
    }
  };
  return { goBack, navigate, history };
};
