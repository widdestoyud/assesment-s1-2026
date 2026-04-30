import type { HttpResponse } from '@core/protocols/http';
import type { UseCaseProtocol } from '@core/protocols/use_case';
import type {
  WcmsDataInterface,
  WebUIData,
} from '@core/services/config.service';
import type { AwilixRegistry } from '@di/container';

export const GetAllWebConfig = ({
  configService,
  useQueryTanstack,
  config,
}: AwilixRegistry): UseCaseProtocol => ({
  useCase: <T>() => {
    const q = btoa(
      config.encrypt.key + JSON.stringify({ version: config.appVersion })
    );

    const webUIConfig = useQueryTanstack({
      queryKey: ['web-config'],
      queryFn: () => configService.getWebUIConfig(q),
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 15,
    });

    const assets = useQueryTanstack({
      queryKey: ['web-assets'],
      queryFn: () => configService.getAssets(),
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60,
    });
    return {
      isLoading: webUIConfig?.isPending || assets?.isLoading,
      webUIConfig: webUIConfig?.data,
      assets: assets?.data,
    } as T;
  },
});

export interface GetAllWebConfigInterface {
  isLoading: boolean;
  webUIConfig: HttpResponse<WebUIData>;
  assets: WcmsDataInterface;
}
