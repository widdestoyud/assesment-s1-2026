import type { AwilixRegistry } from '@di/container';

export interface LoadingControllerInterface {
  isLoading: boolean;
}

const LoadingController = ({
  useLoading,
}: AwilixRegistry): LoadingControllerInterface => {
  const { loading } = useLoading();

  return {
    isLoading: loading,
  };
};

export default LoadingController;
