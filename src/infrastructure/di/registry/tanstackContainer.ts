import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import {
  useNavigate,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router';
import { AwilixContainer, asValue } from 'awilix';

export function registerTanstackModule(container: AwilixContainer) {
  container.register({
    useQueriesTanstack: asValue(useQueries),
    useQueryTanstack: asValue(useQuery),
    useMutationTanstack: asValue(useMutation),
    useNavigateTanstack: asValue(useNavigate),
    useRouteContextTanstack: asValue(useRouteContext),
    useRouterTanstack: asValue(useRouter),
  });
}

export interface TanstackContainerInterface {
  useQueriesTanstack: typeof useQueries;
  useQueryTanstack: typeof useQuery;
  useMutationTanstack: typeof useMutation;
  useNavigateTanstack: typeof useNavigate;
  useRouteContextTanstack: typeof useRouteContext;
  useRouterTanstack: typeof useRouter;
}
