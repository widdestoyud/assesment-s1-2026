import type { UseNavigateResult } from '@tanstack/router-core';
import type { GetAllWebConfigInterface } from '@core/use_case/GetAllWebConfig';
import type { AwilixRegistry } from '@di/container';

const SplashController = ({
  getAllConfigUseCase,
  useEffect,
  useNavigation,
}: AwilixRegistry): SplashControllerInterface => {
  const { navigate } = useNavigation();

  const { isLoading } = getAllConfigUseCase.useCase<GetAllWebConfigInterface>();

  useEffect(() => {
    setTimeout(
      () =>
        navigate({
          to: 'landing-page',
          viewTransition: true,
        }),
      800
    );
  }, []);

  return {
    isLoading,
    navigate,
  };
};

export interface SplashControllerInterface {
  isLoading: boolean;
  navigate: UseNavigateResult<any>;
}

export default SplashController;
